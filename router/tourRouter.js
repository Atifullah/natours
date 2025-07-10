const express = require('express');
const tourRoute = express.Router();
const tourController = require('./../controllers/tourController');
// tourRoute.param('id', tourController.checkID);

tourRoute
  .route('/top-5-cheap')
  .get(tourController.aliasTopTour, tourController.getAllTours);

tourRoute
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);
tourRoute
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = tourRoute; // in tourRouter.js
