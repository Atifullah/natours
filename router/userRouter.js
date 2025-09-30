const express = require('express');
const userRoute = express.Router();
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

// user route
userRoute.post('/signup', authController.signup);
userRoute.post('/login', authController.login);
userRoute.post('/forgotPassword', authController.forgotPassword);
userRoute.patch('/resetPassword/:token', authController.resetPassword);
userRoute.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword,
);
userRoute
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
userRoute
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    userController.deleteUser,
  );

module.exports = userRoute; // in userRouter.js
