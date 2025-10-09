// controllers/reviewController.js
const Review = require('../modals/reviewModal');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all reviews
exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId }; // nested route support

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews },
  });
});

// Get single review
exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) return next(new AppError('No review found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: { review },
  });
});

// Create review
exports.createReview = catchAsync(async (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id; // from auth middleware

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { review: newReview },
  });
});

// Update review
exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!review) return next(new AppError('No review found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: { review },
  });
});

// Delete review
exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);

  if (!review) return next(new AppError('No review found with that ID', 404));

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
