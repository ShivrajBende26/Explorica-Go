const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const events = require('../data/events');
const additionalTours = require('../dev-data/data/additional-tours');

const eventPageSize = 6;
const tourPageSize = 9;

const getCatalogTours = async () => {
  const databaseTours = await Tour.find();
  const existingNames = new Set(databaseTours.map(tour => tour.name));
  const sampleTours = additionalTours
    .filter(tour => !existingNames.has(tour.name))
    .map(tour => ({
      ...tour,
      isSample: true,
      guides: [],
      reviews: []
    }));

  return [...databaseTours, ...sampleTours];
};

const formatEventQuery = (page, search, category) => {
  const params = new URLSearchParams();
  if (search) params.set('q', search);
  if (category) params.set('category', category);
  params.set('page', page);
  return `/events?${params.toString()}`;
};

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      "Your payment was received. If your booking doesn't appear yet, refresh this page in a moment.";
  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await getCatalogTours();
  const upcomingEvents = [...events]
    .sort((first, second) => first.startDate - second.startDate)
    .slice(0, 3);

  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
    events: upcomingEvents
  });
});

exports.getTours = catchAsync(async (req, res) => {
  const search =
    typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
  const sort = ['price-asc', 'price-desc', 'rating', 'duration'].includes(
    req.query.sort
  )
    ? req.query.sort
    : 'recommended';
  const tours = (await getCatalogTours())
    .filter(tour => {
      const searchableText =
        `${tour.name} ${tour.summary} ${tour.startLocation.description}`.toLowerCase();
      return !search || searchableText.includes(search.toLowerCase());
    })
    .sort((first, second) => {
      if (sort === 'price-asc') return first.price - second.price;
      if (sort === 'price-desc') return second.price - first.price;
      if (sort === 'rating') return second.ratingsAverage - first.ratingsAverage;
      if (sort === 'duration') return first.duration - second.duration;
      return 0;
    });
  const pageCount = Math.max(1, Math.ceil(tours.length / tourPageSize));
  const requestedPage = Number.parseInt(req.query.page, 10);
  const page = Number.isInteger(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), pageCount)
    : 1;
  const urlForPage = pageNumber => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (sort !== 'recommended') params.set('sort', sort);
    params.set('page', pageNumber);
    return `/tours?${params.toString()}`;
  };
  const pages = Array.from({ length: pageCount }, (_, index) => {
    const number = index + 1;
    return { number, url: urlForPage(number), active: number === page };
  });

  res.status(200).render('tours', {
    title: 'Explore tours',
    tours: tours.slice((page - 1) * tourPageSize, page * tourPageSize),
    search,
    sort,
    page,
    pageCount,
    resultCount: tours.length,
    pages,
    previousUrl: page > 1 ? urlForPage(page - 1) : null,
    nextUrl: page < pageCount ? urlForPage(page + 1) : null
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user'
  });

  const selectedTour =
    tour ||
    additionalTours.find(sampleTour => sampleTour.slug === req.params.slug);
  if (!selectedTour) return next(new AppError('There is no tour with that name.', 404));

  // 2) Build template
  // 3) Render template using data from 1)
  res.status(200).render('tour', {
    title: `${selectedTour.name} Tour`,
    tour: tour || { ...selectedTour, isSample: true, guides: [], reviews: [] }
  });
});

exports.getEvents = (req, res) => {
  const search =
    typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
  const requestedCategory =
    typeof req.query.category === 'string' ? req.query.category : '';
  const categories = [...new Set(events.map(event => event.category))].sort();
  const category = categories.includes(requestedCategory) ? requestedCategory : '';
  const filteredEvents = events
    .filter(event => {
      const searchableText =
        `${event.title} ${event.location} ${event.summary} ${event.category}`.toLowerCase();
      return (
        (!search || searchableText.includes(search.toLowerCase())) &&
        (!category || event.category === category)
      );
    })
    .sort((first, second) => first.startDate - second.startDate);
  const pageCount = Math.max(1, Math.ceil(filteredEvents.length / eventPageSize));
  const requestedPage = Number.parseInt(req.query.page, 10);
  const page = Number.isInteger(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), pageCount)
    : 1;
  const start = (page - 1) * eventPageSize;
  const pages = Array.from({ length: pageCount }, (_, index) => {
    const pageNumber = index + 1;
    return {
      number: pageNumber,
      url: formatEventQuery(pageNumber, search, category),
      active: pageNumber === page
    };
  });

  res.status(200).render('events', {
    title: 'Events',
    events: filteredEvents.slice(start, start + eventPageSize),
    categories,
    search,
    category,
    page,
    pageCount,
    pages,
    previousUrl: page > 1 ? formatEventQuery(page - 1, search, category) : null,
    nextUrl: page < pageCount ? formatEventQuery(page + 1, search, category) : null,
    resultCount: filteredEvents.length
  });
};

exports.getEvent = (req, res, next) => {
  const event = events.find(item => item.slug === req.params.slug);
  if (!event) {
    return next(new AppError('There is no event with that name.', 404));
  }

  res.status(200).render('event', {
    title: event.title,
    event
  });
};

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Create your account'
  });
};

exports.getForgotPasswordForm = (req, res) => {
  res.status(200).render('forgotPassword', {
    title: 'Reset your password'
  });
};

exports.getPasswordResetForm = (req, res) => {
  res.status(200).render('resetPassword', {
    title: 'Choose a new password',
    resetToken: req.params.token
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});
