import mongoose, { mongo, Schema } from "mongoose";
// we have installed one more library bycrpt what it does is it hashes the password
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true, //if we want that field to be searched  or for searching we use the index 
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        // index:true, //if we want that field to be searched  or for searching we use the index 
    },
    fullName: {
        type: String,
        required: true,
        index: true,
        lowercase: true,
        trim: true,
        // index:true, //if we want that field to be searched  or for searching we use the index 
    },
    avatar: {
        type: String,   //here we are using the cloudinary services
        required: true
    },
    coverImage: {
        type: String,   //here we are using the cloudinary services
    },
    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: ""//we are taking this from the video model
    }],
    password: {
        type: String,
        required: [true, "Password is required"],
        unique: true,
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true })


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

// THIS IS HOW THE TOKEN IS GENERATED 
// TO GENERATE THE TOKEN WE KNOW THAT JWT PROVIDES US A FUNCTION SIGN() WHICH TAKES PAYLOAD PRIVATE_KEY AND THE EXPIRY
userSchema.methods.generateAccessToken = async function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        fullName: this.fullName
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        fullName: this.fullName
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
// inside mongoDB the names are stored in the form of the plurals if it is user then it is saved as users  
export const User = mongoose.model('User', userSchema)