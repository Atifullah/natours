const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty!'],
      trim: true,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      required: [true, 'A review must have a rating'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    // Always include virtual fields when outputting JSON or Objects
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Populate user info automatically (if needed)
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// Prevent duplicate reviews per user per tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Create the Review model
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
