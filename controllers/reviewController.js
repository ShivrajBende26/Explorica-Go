const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.setTourUserIds = (req, res, next) => {
  if (req.params.tourId) req.body.tour = req.params.tourId;
  req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = catchAsync(async (req, res, next) => {
  const filter = { _id: req.params.id };
  if (req.user.role !== 'admin') filter.user = req.user.id;

  const updates = {};
  if (req.body.review !== undefined) updates.review = req.body.review;
  if (req.body.rating !== undefined) updates.rating = req.body.rating;

  const review = await Review.findOneAndUpdate(filter, updates, {
    new: true,
    runValidators: true
  });
  if (!review) {
    return next(new AppError('No review found with that ID.', 404));
  }

  res.status(200).json({ status: 'success', data: { data: review } });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const filter = { _id: req.params.id };
  if (req.user.role !== 'admin') filter.user = req.user.id;

  const review = await Review.findOneAndDelete(filter);
  if (!review) {
    return next(new AppError('No review found with that ID.', 404));
  }

  res.status(204).json({ status: 'success', data: null });
});
