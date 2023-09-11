const mongoose = require('mongoose');
const contactschema=new mongoose.Schema({
    name:{type:String,required:true},
    mobile:{type:Number,required:true},
    email:{type:String,required:true},
    message:{type:String,required:true }})
const contactUs=new mongoose.model('contactUs',contactschema);
module.exports=contactUs;