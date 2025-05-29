const express = require('express');
const tourRoute = express.Router();
const tourController = require('./../controllers/tourController');
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
