//importing modals
const Product = require("../modals/productModal");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apiFeatures");

//create product ----- Admin
exports.createProduct = catchAsyncError(async (req, res) => {
  req.body.user = req.user._id;
  // console.log(req.user);
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});

//get all products
exports.getAllProducts = catchAsyncError(async (req, res, next) => {
  const resultPerPage = 8;
  const productCount = await Product.countDocuments();
  const apiFeatures = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter();

  let product = await apiFeatures.query;

  let filteredProductsCount = product.length;

  apiFeatures.pagination(resultPerPage);

  product = await apiFeatures.query;

  res.status(200).json({
    success: true,
    product,
    productCount,
    resultPerPage,
    filteredProductsCount,
  });
});

//get product details
exports.getProductDetails = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

//update product by id ------ Admin
exports.updateProducts = catchAsyncError(async (req, res, next) => {
  let product = Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  }).catch((err) => {
    res.status(500).send("Error in Updating Products.");
  });

  res.status(200).json({
    success: true,
    product,
  });
});

//delete the product -------- Admin
exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  await product.remove();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

//create and update product review
exports.getProductReview = catchAsyncError(async (req, res, next) => {
  const { product_id, rating, comment } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(product_id);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  let msg;

  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.rating = rating;
        review.comment = comment;
      }
    });
    msg = "Product review updated successfully.";
  } else {
    product.reviews.push(review);
    product.numOfReview = product.reviews.length;
    msg = "Product review added successfully.";
  }

  let avg = 0;
  product.reviews.forEach((review) => {
    avg += review.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: msg,
  });
});

//delete the review  --- Admin
exports.deleteReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.product_id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (review) => review._id.toString() !== req.query.review_id.toString()
  );

  let avg = 0;

  reviews.forEach((review) => {
    avg += review.rating;
  });

  const ratings = avg / reviews.length;

  const numOfReview = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.product_id,
    { reviews, ratings, numOfReview },
    { new: true, useFindAndModify: false, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Review Deleted Successfully.",
  });
});

//get all review ---admin
exports.getAllReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});
