const express = require('express');
const app = express();
const errorMiddleware = require('./middleware/error');
const cookieParser = require('cookie-parser');


// initialize express json
app.use(express.json());
//initialize cookie parser 
app.use(cookieParser());

//routes import
const productsRoute = require('./routes/productRoute'); 
const userRoute = require('./routes/userRoute');
const orderRoute = require('./routes/orderRoute');

//initializing routes
app.use('/api/v1/',productsRoute);
app.use('/api/v1/',userRoute);
app.use('/api/v1/',orderRoute);

app.use('/', (req,res,next) => {
    res.status(200).json({message: 'app is runnig fine......'})
})
//initialize the error middleware
app.use(errorMiddleware);


module.exports = app