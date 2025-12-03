const { json } = require('express');
const Tour = require('../modals/tourModal');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// top cheap items

exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summery,difficulty';
  next();
};

// Routes Handlers
exports.getAllTours = factory.getAll(Tour, { path: 'reviews' });
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.deletedTour = factory.deleteOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.createTour = factory.createOne(Tour);

exports.tourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTour: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      tour: stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      tour: plan,
    },
  });
});
exports.getGeoLocation = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  if (!latlng) {
    return next(
      new AppError('Please provide latlng in the format lat,lng', 400),
    );
  }

  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    return next(
      new AppError('Please provide both latitude and longitude!', 400),
    );
  }

  // Convert distance to radians (Earth radius: mi=3963, km=6378)
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng * 1, lat * 1], radius],
      },
    },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});
