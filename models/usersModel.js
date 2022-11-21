const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto=require("crypto")
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your name"],
    maxLength: [30, "Name cannot exceed 30 characters"],
    minLength: [4, "Name should have more than 4 characters"],
  },
  email: {
    type: String,
    required: [true, "Please Enter Your email"],
    unique: true,
    validate: [validator.isEmail, "Please Enter a valid Email"],
  },
  password: {
    type: String,
    required: [true, "Please enter your Password"],
    minLength: [8, "Password should be greater than 8 characters"],
    select: false,
  },
  avatar: {
    url: {
      type: String,
      required: true,
    },
  },
  role: {
    type: String,
    default: "user",
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

//HASH PASSWRD
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

//JWT TOKEN
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

//COMPARE PASSWORD
userSchema.methods.comparePassword=async function(enteredPassword){
  
  return await bcrypt.compare(enteredPassword,this.password)
}

//GENERATING PASSWORD RESET TOKEN
userSchema.methods.getResetPasswordToken=function(){
  //GENERATE TOKEN
  const resetToken=crypto.randomBytes(20).toString("hex");

  //HASH AND ADD resetpasswordtoken and resetPasswordExpire to userSchema
  this.resetPasswordToken=crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpire=Date.now()+15*60*1000;
  return resetToken;
}



module.exports = mongoose.model("User", userSchema);
