import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.models.js"
import { uploadonCloudinary } from "../utils/cloudinary.js"
const registerUser = asyncHandler(async (req, res) => {
    /*
    step 1: get the user details from the frontend
    step 2: validation of data sent by the user {whether the user has entered all the field or whether the email is in right manner etc}
    step 3: Check if user already exist {through username or by using email id} 
    step 4: Check for images ,check for avatar
    step 5: Upload them to cloudinary,avatar 
    step 6: create user object - create entry in DB
    step 7:remove password and refresh token field from response
    Check for user creation {if created send a response {else return the error response}}
*/
    // we use "req.body()" to get the data from JSON or the forms
    // but we use different things for the the coming from the URL
    const { fullName, email, username, password } = req.body
    console.log("Email", email);
    
    if ([fullName, email, username, password].some((field) => field.trim() === "")) {
        throw new apiError(400, "All fields are compulsory")
    }

    const existedUser = User.findOne({
        /*we can use the inbuilt mongoose operators by using the dollar sign
        there are soo many operators for more ref use chatgpt*/
        $or: [{ username }, { email }]

    })
    if (existedUser) {
        throw new apiError(409, "User with this user name or the email already exist")
    }
    // here in the below middleware {multer} has given much more options like we have body inbuilt in express and we get the access to files attribute from multer
    // what multer does is it add additional functionalities to the request
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) throw new apiError(400, "Avatar file is required")

    const avatar = await uploadonCloudinary(avatarLocalPath)
    const coverImage = await uploadonCloudinary(coverImageLocalPath)

    if (!avatar) throw new apiError(400, "Avatar file is required")

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    /*WE CAN CHECK WHETHER THE USER IS CREATED OR NOT BY CHECKING ITS ID BECAUSE MONGODB CREATES AN ELEMENT _ID WITH EVERY NEW OBJECT CREATED SO WE CAN USE THAT TO CHECK THE OBJECT IS CREATED OR NOT
    */
    /*SO AS PER THE ABOVE STEPS WE NEED TO REMOVE THE PASSWORD AND REFReSH TOKEN FROM THE DATABASE SO TO DO THAT WE HAVE A METHOD CALLED SELECT {THIS METHOD IS SOMETHING WEIRD} {INITIALLY EVERYTHING IS SELECTED SO TO REMOVE A FIELD WE USE A SYNTAX "-PASSWORD" WE'LL JUST PUT THE "-" INFRonT OF THAT FIELD */
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) throw new apiError(500, "SOMETHING WENT WRONG WHILE REGISTERING THE USER")
    return res.status(201).json(
        new apiResponse(200,createdUser,"User Registered Successfully")
    )



})

export { registerUser }
