const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken");
const User = require("../modals/userModal")

exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
    const {token} = req.cookies;
    // console.log(token);
    if(!token){
        return next(new ErrorHandler("Please login to access this page",401));
    }

    const decodeData = jwt.verify(token,process.env.JWT_SECRET);

    req.user = await User.findById(decodeData.id);

    next();
});


exports.authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
          return next(
            new ErrorHandler(
              `Role: ${req.user.role} is not allowed to access this resouce `,
              403
            )
          );
        }
        next();
    }
};