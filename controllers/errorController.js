const AppError = require('./../utils/appError');

const handleCastErrorDb = (err) => {
  const message = `invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldDb = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value: "${value}" for "${field}". Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
const sendErrorProd = (res, err) => {
  // operational,truested error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // log
    console.error('error ', err);
    // some generaic message
    res.status(500).json({
      status: 'error',
      message: ' something went very wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(res, err); // ✅ correct order
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err); // ✅ fix: preserve nested error properties
    if (error.name === 'CastError') error = handleCastErrorDb(error);
    if (error.code === 11000) error = handleDuplicateFieldDb(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);

    sendErrorProd(res, error); // ✅ correct order
  }
};
