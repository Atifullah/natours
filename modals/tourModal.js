const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must be equal or less than 40 characters'],
      minlength: [10, 'A tour name must be equal or more than 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },

    slug: String,

    secretTour: {
      type: Boolean,
      default: false,
    },

    duration: {
      type: Number,
      required: [true, 'A tour must have duration'],
    },

    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have max group size'],
    },

    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficulty'],
        message: 'Difficulty is either: easy, medium, or difficulty',
      },
    },

    // ⭐ Required for Review Average Rating
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, // 4.6666 → 4.7
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: [true, 'A tour must have price'],
    },

    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price; // Only works on CREATE
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },

    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },

    description: {
      type: String,
      trim: true,
    },

    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },

    images: [String],

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },

    startDates: [Date],

    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
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
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
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

// ⭐ Indexes
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// ⭐ Virtual populate for reviews
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// Virtual duration in weeks
tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});

// ✔ Document middleware – create slug
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// ✔ Query middleware – hide secret tours
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// ✔ Populate guides
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

// ✔ Aggregation middleware – hide secret tours
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
