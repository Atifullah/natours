const express = require('express');
const tourRoute = express.Router();
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
// tourRoute.param('id', tourController.checkID);

tourRoute
  .route('/top-5-cheap')
  .get(tourController.aliasTopTour, tourController.getAllTours);

tourRoute.route('/tour-stats').get(tourController.tourStats);
tourRoute.route('/monthlyPlan/:year').get(tourController.getMonthlyPlan);

tourRoute
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);
tourRoute
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );
module.exports = tourRoute; // in tourRouter.js
