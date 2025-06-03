const express = require('express');
const tourRoute = require('./router/tourRouter');
const userRoute = require('./router/userRouter');
const app = express();

// Middleware

const morgan = require('morgan');
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.static(`${__dirname}/public`));

app.use(express.json());
app.use((req, res, next) => {
  req.todaydate = new Date().toISOString();
  next();
});

// Routes

app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/users', userRoute);

module.exports = app;
