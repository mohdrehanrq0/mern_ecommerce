const ErrorHandler = require('../utils/ErrorHandler');

module.exports = (err,req,res,next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server error";

    //wrong mongodb id error
    if(err.name == "CastError"){
        const message = 'Resource not found. Invalid: '+err.path;
        err = new ErrorHandler(message,400);
    }

    //Duplicate error
    if(err.code === 11000 ){
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message,400);
    }

    //wrong jwt error  
    if(err.name === 'JsonWebTokenError'){
        const message = `JWT token is invalid. try again`;
        err = new Error(message, 400);
    }

    //jwt expire error
    if(err.name === 'TokenExpiredError'){
        const message = `JWT token is expired. try again`;
        err = new Error(message,400);   
    } 


    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        stack_trace: err.stack
    });
}