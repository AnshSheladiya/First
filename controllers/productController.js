const Product=require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors=require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const multer=require("multer");

//MULTER 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
      let mimetype=file.mimetype.split('/')[1]
      const name = file.fieldname+ Date.now()+`.${mimetype}`;
      cb(null, name );
  }
})
const upload=multer({storage:storage}).single("image");
const multiUpload=multer({storage:storage}).array("images");


//CREATE PRODUCT --Admin
exports.createProduct=catchAsyncErrors(async(req,res)=>{
    req.body.user=req.user.id;
    const product=await Product.create(req.body);
    res.status(201).json({success:true,product})
})

//UPDATE PRODUCT --Admin
exports.updateProduct=catchAsyncErrors(async(req,res)=>{

    let product=await Product.findById(req.params.id);
   if(!product){
        return next(new ErrorHandler("Product Not Found",500))
    }

    product=await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    res.status(200).json({success:true,product})
})

//DELETE PRODUCT
exports.deleteProduct=catchAsyncErrors(async(req,res)=>{

    const product=await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler("Product Not Found",500))
    }
    await product.remove();
    res.status(200).json({success:true,message:"Product deleted Successfully."})
})

//GET PRODUCT DETAILS
exports.getProductDetails=catchAsyncErrors(async(req,res,next)=>{
    const product=await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler("Product Not Found",500))
    }
    res.status(200).json({success:true,product})
})


//GET PRODUCTS
exports.getAllProducts=async(req,res)=>{
    const resultsPerPage=5;
    const productCount=await Product.countDocuments();
    const apiFeature=new ApiFeatures(Product.find(),req.query).search().filter().pagination(resultsPerPage);
    const products=await apiFeature.query;
    res.status(200).json({success:true,products,productCount})
}

//CREATE AND UPDATED ADD REVIEW 
  exports.createProductReview = async (req, res, next) => {
    const { rating, comment, productId } = req.body;
  
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };
  
    const product = await Product.findById(productId);
    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );
    if (isReviewed) {

      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString()){
          (rev.rating = rating), (rev.comment = comment)

        }
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }
  
    let avg = 0;
  
    product.reviews.forEach((rev) => {
      avg += rev.rating;
    });
  
    product.ratings = avg / product.reviews.length;
  
    await product.save({ validateBeforeSave: false });
  
    res.status(200).json({
      success: true,
    });
  };

//UPLOAD IMAGES OF PRODUCT
exports.uploadProductImages=catchAsyncErrors(async(req,res,next)=>{
   multiUpload(req, res, async(err) => {
      if(err) {
        return next(new ErrorHandler("Something went Wrong.",404))
      }
      const product=await Product.findById(req.params.id);
         res.status(200).json({success:true,images});
  });
})


