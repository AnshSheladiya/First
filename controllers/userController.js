const User = require("../models/usersModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail.js");

//REGISTER USER
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;
  const alreadyRegistered=await User.findOne({email:email});
  if(alreadyRegistered){
    return next(new ErrorHandler(`already registered.`,401))
  }
  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "this is sample",
      url: "ProfilePic",
    },
  });
  //JWTTOKEN
  sendToken(user, 201, res);
});

//LOGIN USER
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email and Password", 401));
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invaild email or Password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invaild email or Password", 401));
  }

  //JWTTOKEN
  sendToken(user, 200, res);
});

//LOGOUT USER
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({ status: true, message: "Logged Out" });
});

//FORGOT PASSWORD
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  //GET RESET PASSWORD TOKEN
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${resetToken}`;
  const message = `Your Password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requsted this email then,please ignore it`;
  try {
    await sendEmail({
      email: user.email,
      subject: `Password Recovery`,
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

//GET USER DETAILS
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

//UPDATE USER PASSWORD
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

//UPDATE USER PROFILE
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});


//GET ALL USER --ADMIN
exports.getAllUser=catchAsyncErrors(async(req,res,next)=>{
  const users=await User.find();
  res.status(200).json({success:true,users})
})

//GET SINGLE USER BY ID --ADMIN
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHander(`User does not exist with Id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

//UPDATE USER ROLE --ADMIN
exports.updateProfileRole = catchAsyncErrors(async (req, res, next) => {

  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if(!user){
    return next(new ErrorHandler(`User does not exist with ID:${req.params.id}`))
  }
  res.status(200).json({
    success: true,
  });
});


//DELETE USER BY ID --ADMIN
exports.deleteUser=catchAsyncErrors(async(req,res,next)=>{
  
  const user=await User.findById(req.params.id);
  if(!user){
    return next(new ErrorHandler(`User does not exist with ID:${req.params.id}`))
  }
  await user.remove();
  res.status(200).json({
    success: true,
    message:"User Deleted Successfully."
  });
})

