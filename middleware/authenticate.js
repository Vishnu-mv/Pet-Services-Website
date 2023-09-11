const jwt=require('jsonwebtoken');
const Signupmodel=require('../model/signup');
const authenticate=async (req,res,next)=>{
    try {
        const token=req.cookies.jwtoken;
        const verifyToken=jwt.verify(token,'process.env.SECRET_KEY');
        const rootUser=await Signupmodel.findOne({_id:verifyToken._id});
        if(!rootUser){throw new Error('User not Found')};
        req.token=token;
        req.rootUser=rootUser;
        req.userID=rootUser._id;
        next();
    } catch (error) {
        res.status(401).send(error);
        console.log(error);
    }
}
module.exports=authenticate;