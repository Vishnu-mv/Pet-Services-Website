const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');




const Userschema = new mongoose.Schema({
    UserName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    Mobile: {
        type: Number,
        required: true,
        unique: true
    },
    Password: {
        type: String,
        required: true
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]


    // refreshToken:String
});

//bcrypting 
Userschema.pre('save', async function(next){
    if (!this.isModified('Password')){
        next()
    }
    this.Password= await bcrypt.hash(this.Password, 10);
});



//generating tokens
Userschema.methods.generateAuthToken = async function () {
    try {
        let token = jwt.sign({ _id: this._id }, 'process.env.SECRET_KEY');
        this.tokens = this.tokens.concat({ token: token })     //1st is dbtoken and 2nd is token generated in above line
        await this.save();
        return token;
    } catch (error) {
        console.log(error)
    }
}




const Signupmodel = new mongoose.model('user', Userschema); //make sure Signupmodel name is starts with cap letter
module.exports = Signupmodel;