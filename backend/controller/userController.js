const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const User = require("../modals/userModal");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

//user registration
exports.userRegistration = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "this is sample public id",
      url: "sample url",
    },
  });

  sendToken(user, 201, res);
});

//login user
exports.userLogin = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  //check email exist or not
  if (!email || !password) {
    return next(new ErrorHandler("Please enter Email and Password", 400));
  }

  const user = await User.findOne({ email: email }).select("password");

  if (!user) {
    return next(new ErrorHandler("Please enter Email and Password", 400));
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return next(new ErrorHandler("Please enter Email and Password", 400));
  }

  sendToken(user, 200, res);
});

//logout user
exports.logoutUser = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logout successfully",
  });
});

//forgot password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  //get password tokens
  const returnObjects = await user.getResetPasswordToken();
  const resetToken = returnObjects.resetToken;

  await User.findOneAndUpdate(
    { email: req.body.email },
    {
      resetPasswordToken: returnObjects.resetPasswordToken,
      resetPasswordExpire: returnObjects.resetPasswordExpire,
    },
    { new: true }
  );

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your password reset token is : \n\n ${resetPasswordUrl}. \nIf you have not requested this email than, please ignore it.`;

  // console.log(user);

  try {
    await sendEmail({
      email: user.email,
      subject: "Ecommerce product recovery.",
      message,
      name: user.name,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully.`,
    });
  } catch (error) {
    await User.findOneAndUpdate(
      { email: req.body.email },
      { resetPasswordToken: undefined, resetPasswordExpire: undefined },
      { new: true }
    );

    return next(new ErrorHandler(error.message, 500));
  }
});

//resset password
exports.resetPassword = async (req, res, next) => {
  //get token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler("Reset Password token is invalid or expire.", 400)
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password doesn't match.", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save({ validateBeforeSave: false });

  sendToken(user, 200, res);
};

//get user details
exports.getUserDetails = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne(req.user._id);

  if (!user) {
    return next(new ErrorHandler("User doen't exist", 400));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

//get user details
exports.updateUserPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne(req.user._id).select("+password");

  if (!user) {
    return next(new ErrorHandler("User doen't exist", 400));
  }

  const isPasswordMatch = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatch) {
    return next(new ErrorHandler("Old Password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmNewPassword) {
    return next(new ErrorHandler("Password doesn't match", 400));
  }

  user.password = req.body.newPassword;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Password updated successfully.",
  });
});

//update user details
exports.updateUserDetails = catchAsyncError(async (req, res, next) => {
  const updateQuery = {
    name: req.body.name,
    email: req.body.email,
  };

  //adding cloudinary after
  const user = await User.findByIdAndUpdate(req.user.id, updateQuery, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

// get all user ---- admin
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

// get single user  ---- admin
exports.getSingleUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("User doesn't exist", 400));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

//update user details -- admin
exports.updateUserProfile = catchAsyncError(async (req, res, next) => {
  const updateQuery = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, updateQuery, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

//delete user ---- admin
exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("User doesn't exist.", 400));
  }

  await user.delete();

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});
