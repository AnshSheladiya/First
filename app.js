const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cookieParser=require("cookie-parser");
const bodyParser = require("body-parser");

//HANDLING UNCAUGHT EXCEPTION
process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Uncaught Exception`);
    process.exit(1);
})

//SETUP MODULE
app.use(express.json());
app.use(cookieParser());
app.use(morgan("tiny"));
app.use(bodyParser.urlencoded({ extended: true }));
const port = process.env.PORT || 3000;

//CONFIG
dotenv.config({ path: "config/config.env" });
require("./db/conn");


//ROUTE IMPORTS
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order=require("./routes/orderRoute")
//ROUTES
app.use("/products", product);
app.use("/user", user);
app.use("/order", order);

//MIDDLEWARE IMPORTS
const errorMiddleware = require("./middleware/error");
app.use(errorMiddleware);


//LISTEN SERVER
const server=app.listen(port, () => console.log(`app listening on port ${port}!`));

// UNHANDLED PROMISE REJECTION
process.on("unhandledRejection",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);

    server.close(()=>{
        process.exit(1);
    })
})