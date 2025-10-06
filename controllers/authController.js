const User = require('./../modals/userModal');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const { promisify } = require('util');
const crypto = require('crypto');
const sendEmail = require('./../utils/email');

// Generate JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// 🔑 DRY helper function
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Optionally, remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// ------------------ Controllers ------------------

// Signup
exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    role: req.body.role,
  });

  createSendToken(newUser, 201, res);
});

// Login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res);
});

// Reset Password

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user by email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('No user found with that email', 404));
  }

  // 2) Generate reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send token to user via email
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and confirmPassword to: ${resetURL}.\nIf you didn't request a password reset, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
      resetURL, // 🔥 only for development/debugging
    });
  } catch (err) {
    // Rollback the reset fields if email fails
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500,
      ),
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  createSendToken(user, 200, res);
});

// Update Password
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!user) return next(new AppError('User not found', 404));

  const isCorrect = await user.correctPassword(
    req.body.currentPassword,
    user.password,
  );

  if (!isCorrect) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  user.password = req.body.newPassword;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  createSendToken(user, 200, res);
});
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log('Current user role:', req.user.role); // 👈 log here

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    next();
  };
};

// protect the users
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token found
  if (!token) {
    return next(new AppError('User is not logged in / signed up', 401));
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401),
    );
  }

  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please log in again.', 401),
    );
  }

  req.user = freshUser;
  next();
};
