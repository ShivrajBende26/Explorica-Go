const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new AppError('Stripe payments are not configured on this server.', 503);
  }
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
};

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) return next(new AppError('No tour found with that ID.', 404));

  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    metadata: {
      userId: req.user.id
    },
    line_items: [
      {
        price_data: {
          currency: process.env.STRIPE_CURRENCY || 'usd',
          unit_amount: Math.round(tour.price * 100),
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`
            ]
          }
        },
        quantity: 1
      }
    ]
  });

  res.status(200).json({
    status: 'success',
    session
  });
});

const createBookingCheckout = async session => {
  if (session.payment_status !== 'paid') return;
  if (!session.client_reference_id || !Number.isFinite(session.amount_total)) {
    throw new Error('Stripe checkout session is missing its tour or paid amount.');
  }

  const userId = session.metadata && session.metadata.userId;
  const user = userId
    ? await User.findById(userId)
    : await User.findOne({ email: session.customer_email });
  if (!user) throw new Error('Stripe checkout session references an unknown user.');

  await Booking.updateOne(
    { stripeSessionId: session.id },
    {
      $setOnInsert: {
        tour: session.client_reference_id,
        user: user.id,
        price: session.amount_total / 100,
        paid: true,
        stripeSessionId: session.id
      }
    },
    { upsert: true }
  );
};

exports.webhookCheckout = catchAsync(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).send('Stripe webhook is not configured.');
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded'
  ) {
    await createBookingCheckout(event.data.object);
  }

  res.status(200).json({ received: true });
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
