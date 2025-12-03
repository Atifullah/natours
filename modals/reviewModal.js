const mongoose = require('mongoose');
const Tour = require('./tourModal'); // IMPORTANT: import your Tour model

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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Populate user info (optional)
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// Prevent duplicate reviews
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// ---------- STATIC METHOD TO CALCULATE AVERAGE ----------
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    // If no reviews left, reset values
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5, // default
    });
  }
};

// ---------- POST MIDDLEWARE FOR CREATE ----------
reviewSchema.post('save', function () {
  // this.constructor = Review
  this.constructor.calcAverageRatings(this.tour);
});

// ---------- PRE middleware for UPDATE & DELETE ----------
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

// ---------- POST middleware for UPDATE & DELETE ----------
reviewSchema.post(/^findOneAnd/, async function () {
  if (this.r) {
    await this.r.constructor.calcAverageRatings(this.r.tour);
  }
});

// Create Review model
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
