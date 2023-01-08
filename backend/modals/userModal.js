const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,"Please enter your name."],
        maxlength: [30, "Should not exceed 30 characters."],
        minlength: [4, "Should not less than 4 characters."]
    },
    email: {
        type: String,
        required: [true,"Please enter your Email address."],
        unique: true,
        validate: [validator.isEmail, "Please Enter a valid email address."]
    },
    password: {
        type: String,
        required: [true,"Please enter your password."],
        minlength: [4, "Should not be less than 4 characters."],
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        default: "user",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

//password hashing using pre event on save
userSchema.pre("save", async function (req, res, next) {

    if(!this.isModified("password")){
        next();
    }

    this.password = await bcrypt.hash(this.password,12);

})

//jwt token schema methods
userSchema.methods.getJWTToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};


//compare password
userSchema.methods.comparePassword = async function (enterPassword){
    return await bcrypt.compare(enterPassword, this.password);
}

//get resetPasswordToken
userSchema.methods.getResetPasswordToken = function() {
    //generating hash
    const resetToken = crypto.randomBytes(20).toString('hex');

    //hashing and adding resetPasswordToken 
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    const returnObjects = {resetToken, resetPasswordExpire, resetPasswordToken};
    return returnObjects;
}



module.exports = mongoose.model('User',userSchema)