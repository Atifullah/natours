const express = require('express');
const tourRoute = require('./router/tourRouter');
const userRoute = require('./router/userRouter');
const appError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const morgan = require('morgan');
const hpp = require('hpp');

const app = express();

// ✅ 1. Security HTTP headers
app.use(helmet());

// ✅ 2. Rate limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many requests from this IP, please try again after an hour.',
  },
});
app.use('/api', limiter);

// ✅ 3. Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// ✅ 4. Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// ✅ 5. Data sanitization against XSS
app.use(xss());

// hpp
app.use(
  hpp({
    whitelist: [
      'duration',
      'price',
      'ratingsAverage',
      'ratingsQuantity',
      'difficulty',
    ],
  }),
);

// ✅ 6. Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ✅ 7. Serving static files
app.use(express.static(`${__dirname}/public`));

// ✅ 8. Custom middleware for request time
app.use((req, res, next) => {
  req.todaydate = new Date().toISOString();
  next();
});

// ✅ 9. Routes
app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/users', userRoute);

// ✅ 10. Handle undefined routes
app.all('*', (req, res, next) => {
  next(new appError(`Can't find ${req.originalUrl} on this server`, 404));
});

// ✅ 11. Global error handler
app.use(globalErrorHandler);

module.exports = app;
