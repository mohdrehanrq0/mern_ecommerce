const Order = require('../modals/orderModal');
const Product = require('../modals/productModal');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncError = require('../middleware/catchAsyncError');

exports.newOrder = catchAsyncError(async (req,res,next) => {
    const { shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    const order = await Order.create({
        shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice,
        paidAt: Date.now(),
        user: req.user._id
    });

    res.status(200).json({
        success: true,
        order
    });
});

//get order details --- admin
exports.getOrderDetails = catchAsyncError(async (req,res,next) => {
    const order = await Order.findById(req.params.orderId).populate("user", "name email");

    if(!order){
        return next(new ErrorHandler("Order details not found", 400));
    }

    res.status(200).json({
        success: true,
        order
    });
})

//get user orders 
exports.getUserOrder = catchAsyncError(async (req,res,next) => {
    const order = await Order.find({ user: req.user._id });

    if(!order){
        return new ErrorHandler("No order found", 404);
    }

    res.status(200).json({ 
        success: true,
        order
    })
});

//get all the orders --admin
exports.getAllorders = catchAsyncError(async (req,res,next) => {
    const orders = await Order.find();

    let totalPrice = 0;
    orders.forEach(e => {
        totalPrice += e.totalPrice;
    });

    res.status(200).json({
        success: true,
        orders,
        totalPrice
    })
});


//update order status
exports.changeOrderStatus = catchAsyncError(async (req,res,next) => {
    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler("Order not found with this Id", 404));
    }

    if(order.orderStatus === "Delivered"){
        return next(new ErrorHandler("Order is already delivered", 400));
    }

    if (req.body.status === "Shipped") {
        order.orderItems.forEach(async (o) => {
          await updateStock(o.product, o.quantity);
        });
    }

    order.orderStatus = req.body.status;

    if(req.body.status == "Delivered"){
        order.deliverAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });

    res.status(201).json({
        success: true,
    })

});

async function updateStock(id, quantity) {
    const product = await Product.findById(id);
  
    product.stock -= quantity;
  
    await product.save({ validateBeforeSave: false });
  }


//delete the orders --admin
exports.deleteOrders = catchAsyncError(async (req,res,next) => {
    const orders = await Order.findById(req.params.id);

    if(!orders){
        return next(new ErrorHandler("Order not found with this Id.", 404)); 
    }

    orders.remove();

    res.status(200).json({
        success: true,
        message: "Order deleted Successful."
    })
});