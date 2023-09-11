//Not required

const mongoose = require('mongoose');
const Userschema=new mongoose.Schema({
    Mobile:{
        type:String,
        required:true
    },
    Password:{
        type:Number,
        required:true
    }
})

const loginmodel=mongoose.model('user',Userschema);
module.exports=loginmodel