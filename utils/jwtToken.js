//CREATE TOKEN AND SAVE IN COOKIES
const sendToken=(user,statusCode,res)=>{
    const token=user.getJWTToken();

    //OPTIONS FOR COOKIES
    const options={
        expires:new Date(
            Date.now()+process.env.COOKIE_EXPIRE*24*60*60*1000
        ),
        httpOnly:true
    }

    res.status(statusCode).cookie("token",token,options).json({
        success:true,user,token
    })
}

module.exports=sendToken;