const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User=require("../models/usersModel")
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

//CREATE NEW ORDER
exports.newOrder = async (req, res,next) => {
    console.log(req.user)
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;
  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt:Date.now(),
    user:req.user._id
  });
 
  res.status(201).json({success:true,order})
};


//GET SINGLE ORDER
exports.getSingleOrder=catchAsyncErrors(async (req, res,next) => {
  const order=await Order.findById(req.params.id).populate("user","name email");
  if(!order){
    return next(new ErrorHandler("Order not found with this Id",404))
  }
  res.status(200).json({success:true,order})
});

//GET ALL ORDERS
exports.getAllOrders=catchAsyncErrors(async (req, res,next) => {
    const order=await Order.find().populate("user","name email");
    if(!order){
      return next(new ErrorHandler("No Orders.",404))
    }
    let totalAmount=0;
    order.forEach((order)=>{
        totalAmount+=order.totalPrice;
    })
    res.status(200).json({success:true,totalAmount,order})
  });


//GET LOGGED IN USER ORDERS
  exports.myOrders=catchAsyncErrors(async (req, res,next) => {
    console.log("req.user")
    const order=await Order.find({user:req.user._id});
    if(!order){
      return next(new ErrorHandler("Order not found with this Id",404))
    }
    res.status(200).json({success:true,order})
  });
  

//UPDATE ORDER STATUS --ADMIN
exports.updateOrder=catchAsyncErrors(async(req,res,next)=>{
    const order=await Order.findById(req.params.id);
    if(!order){
        return next(new ErrorHandler("Order not found with this Id",404))
      }
    if(order.orderStatus==="Delivered"){
        return next(new ErrorHandler("You have already delivered this order",400));
    }
    order.orderItems.forEach(async(order)=>{
         await updateStock(order.product,order.quantity);
    })
    order.orderStatus=req.body.status;
    if(req.body.status==="Delivered"){
        order.deliveredAt=Date.now();
    }
    await order.save({validateBeforeSave:false});
    res.status(200).json({
        success:true
    })
})

async function updateStock(id,quantity){
    const product=await Product.findById(id);
    product.stock-=quantity;
    await product.save({validateBeforeSave:false});
}

//DELETE ORDER 
exports.deleteOrder=catchAsyncErrors(async(req,res,next)=>{
    const order=await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler("No Order Found with this id",404))
      }
      
    await order.remove();
    res.status(200).json({
        success:true,
        message:"deleted SuccessFully."
    })
})
