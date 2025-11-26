const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must be equal or less then 40 charchters'],
      minlength: [10, 'A tour name must be equal or less then 10 charchters'],
      // validate: [validator.isAlpha, 'the tour name must be charachets'],
    },
    slug: String,
    secretTour: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: Number,
      required: [true, 'A tour Must have duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour Must have max Group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour Must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficulty'],
        message: 'the value should be easy,medium or difficulty',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'the rating must be above 1'],
      max: [5, 'the rating must be above 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour Must have Price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour Must have description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour Must have cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    startLocation: {
      // GeoJSON format
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], // [longitude, latitude]
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number], // [longitude, latitude]
        address: String,
        description: String,
        day: Number, // optional: which day the tour reaches this location
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.index({ price: 1, ratingAverage: -1 });
tourSchema.index({ slug: 1 });

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});
// document middlewear
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
//  query middlewear
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
}),
  // aggrgation middlewear

  tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({
      $match: { secretTour: { $ne: true } },
    });
    next();
  });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
