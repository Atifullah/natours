const express = require('express');
const tourRoute = express.Router();
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./reviewRouter');
const router = express.Router();
// tourRoute.param('id', tourController.checkID);

// post /tour/123123/reviews
// get /tour/123123/reviews

// get /tour/123123/reviews/1323123

// tourRoute
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview,
//   );

tourRoute.use('/:tourId/reviews', reviewRouter);
tourRoute
  .route('/top-5-cheap')
  .get(tourController.aliasTopTour, tourController.getAllTours);

tourRoute.route('/tour-stats').get(tourController.tourStats);
tourRoute
  .route('/monthlyPlan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  );

tourRoute
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour,
  );
tourRoute
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deletedTour,
  );

module.exports = tourRoute; // in tourRouter.js
