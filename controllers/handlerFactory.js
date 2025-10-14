const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const ApiFeatures = require('./../utils/apiFeatures');
exports.deleteOne = (Modal) =>
  catchAsync(async (req, res, next) => {
    const doc = await Modal.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new appError('no document found with this ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
      message: 'data is delete',
    });
  });

exports.updateOne = (Modal) =>
  catchAsync(async (req, res, next) => {
    const doc = await Modal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new appError('no documenet found with this ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (modal) =>
  catchAsync(async (req, res, next) => {
    const doc = await modal.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // Build query
    let query = Model.find(filter);

    // Apply populate if provided
    if (populateOptions) query = query.populate(populateOptions);

    const docs = await query;

    // Send response
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });

exports.getAll = (Modal, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Modal.find();
    if (populateOptions) {
      query = query.populate(populateOptions);
    }

    const features = new ApiFeatures(query, req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        doc,
      },
    });
  });
