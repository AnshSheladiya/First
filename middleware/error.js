const ErrorHandler = require("../utils/errorhandler");

module.exports = function(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  //WRONG MONGODB ID ERROR
  if(err.name==="CastError"){
    const message= `Resource not found.Invaild: ${err.path}`;
    err=new ErrorHandler(message,400)
  }

  //MONGOOSE DUPLICATE ERROR
  if(err.code===11000){
    const message=`Duplicate ${Object.keys(err.keyValue)} Email Entered `
    err=new ErrorHandler(message,400)

  }

  //WRONG JWT ERROR
  if(err.name==='JsonWebTokenError'){
    const message=`Json Web Token is Invaild,try again`
    err=new ErrorHandler(message,400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};