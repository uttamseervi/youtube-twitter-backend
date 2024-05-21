import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import {User} from '../models/user.models.js'

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        /*we have the access to cookies from the req and res coz we have given the access to these in app.js file by writing app.use(cookieParser())*/
        const token = req.cookies?.accessToken || req.header("Authorization").replace("bearer ", "")
        // here is the reason why i have written the req.header()
        /* so if the user is sending the custom header instead of the cookie {for reference visit postman in that the header section} there is the key value pair the key is "Authorization" and the value is "bearer(bearer is a keyword)(oneBlankSpace after the blank space ->tokenName)AccessTokenName to access that cookie we write this " */

        if (!token) throw new apiError(401, "UNAUTHORIZED REQUEST");

        const decodedTokenInfo = jwt.verify(token, process.env.ACCES_TOKEN_SECRET)

        const user = await User.findById(decodedTokenInfo?._id).select("-password -refreshToken")

        if (!user) throw new apiError(401, "INVALID ACCESS TOKEN");

        req.user = user;
        next();
    } catch (error) {
        throw new apiError(401,error?.message || "INVALID  ACCESS TOKEN");

    }


})