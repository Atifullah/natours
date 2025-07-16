const express = require('express');
const userRoute = express.Router();
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

// user route
userRoute.post('/signup', authController.signup);
userRoute
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
userRoute
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
module.exports = userRoute; // in userRouter.js
