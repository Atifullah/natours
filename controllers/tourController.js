const { json } = require('express');
const Tour = require('../modals/tourModal');

// top cheap items

exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summery,difficulty';
  next();
};

// Routes Handlers
exports.getAllTours = async (req, res) => {
  try {
    // Step 1: Basic Filtering
    let queryObj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    // Step 2: Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const mongoQueryObj = JSON.parse(queryStr); // ✅ Corrected here

    console.log('Parsed Mongo Query:', mongoQueryObj);

    let query = Tour.find(mongoQueryObj);

    // Step 3: sorting

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      console.log('Sorting by:', sortBy);
      query = query.sort(sortBy); // ✅ valid now
    } else {
      query = query.sort('-createdAt'); // default sort
    }

    // 4 fields limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // 5 pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTour = await Tour.countDocuments();
      if (skip >= numTour) throw new Error('this page is not exist');
    }

    // using methid of query sort select skip limit

    // route for a specific item like 5 best cheap tours data

    const tours = await query;

    // Step 4: Send Response
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    console.error('Error in getAllTours:', err.message);
    res.status(400).json({
      status: 'fail',
      message: 'The data is not getting',
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const findTour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        findTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'invalid id',
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return the updated document
      runValidators: true, // run schema validators
    });

    if (!updatedTour) {
      return res.status(404).json({
        status: 'fail',
        message: 'Tour not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour: updatedTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid update data',
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const deletedTour = await Tour.findByIdAndDelete(req.params.id);

    if (!deletedTour) {
      return res.status(404).json({
        status: 'fail',
        message: 'Tour not found',
      });
    }

    res.status(204).json({
      status: 'success',
      data: null,
      message: 'data is delete',
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid delete request',
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    console.log('Request Body:', req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
