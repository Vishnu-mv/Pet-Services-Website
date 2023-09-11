const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    petName:{type:String,required:true},
    mobile:{type:Number,required:true,},
    userName:{type:String,required:true},
    date:{type:Date,required:true,},
    time:{type:Number,required:true,unique:true },
    service:{type:String,required:true }})
const Bookings=new mongoose.model('Booking',userSchema);
module.exports=Bookings;