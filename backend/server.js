const app = require('./app');
const dotenv = require('dotenv');
const connectDatabase = require('./database/connection');

// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Uncaught Exception`);
    process.exit(1);
  });


//configure dotenv file
dotenv.config({path: './backend/config/config.env'})


//connecting to database
connectDatabase();

const server = app.listen(process.env.PORT, ()=> {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
})

//un handled promise rejection 
process.on('unhandledRejection', (err)=> {
    console.log(`Error : ${err.message}`);
    console.log(`Server is shutting down due to unhandledRejection`);

    server.close(() => {
        process.exit(1);
    });
});