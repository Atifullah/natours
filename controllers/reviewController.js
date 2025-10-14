// controllers/reviewController.js
const Review = require('../modals/reviewModal');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('../controllers/handlerFactory');

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
exports.getReview = factory.getOne(Review);

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id; // from auth middleware
  next();
};
// Create review
exports.createReview = factory.createOne(Review);

// Update review
exports.updateReview = factory.updateOne(Review);

// Delete review
exports.deleteReview = factory.deleteOne(Review);
