const express = require('express');
const tourRoute = require('./router/tourRouter');
const userRoute = require('./router/userRouter');
const app = express();

// Middleware

const morgan = require('morgan');
app.use(morgan('dev'));

app.use(express.json());
app.use((req, res, next) => {
  req.todaydate = new Date().toISOString();
  next();
});

// Routes

app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/users', userRoute);

module.exports = app;
