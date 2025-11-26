const express = require('express');
const userRoute = express.Router();
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

// user route
userRoute.post('/signup', authController.signup);
userRoute.post('/login', authController.login);
userRoute.post('/forgotPassword', authController.forgotPassword);
userRoute.patch('/resetPassword/:token', authController.resetPassword);
// auth login must for all
userRoute.use(authController.protect);
userRoute.patch(
  '/updateMyPassword',

  authController.updatePassword,
);
userRoute.get('/me', userController.getMe, userController.getUser);
userRoute.patch('/updateMe', userController.updateMe);
userRoute.delete('/deleteMe', userController.deleteMe);

userRoute.use(authController.restrictTo('admin', 'lead-guide'));

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
