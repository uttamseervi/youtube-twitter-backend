import { Router } from "express";
import { logoutUser, registerUser,loginUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    // we have the variable upload which is derived from the multer "../middlewares/multer.middleware.js" 
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        }, {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)


// secured routes
/*verifyJWT is the middleware hence it is written before our logout method 
router ek method to run kardega lekin usko pata thodi hai dusra bhi hai isiliye hamne middleware wale file me next() likha hai*/
router.route("/logout").post(verifyJWT, logoutUser)
export default router