import express from "express"
import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { createTweet, updateTweet, deleteTweet, getUserTweets } from "../controllers/tweet.controller.js";
const router = Router();

router.route("/createTweet").post(verifyJWT, createTweet)
router.route("/updateTweet/:tweetId").patch(verifyJWT, updateTweet)
router.route("/deleteTweet/:tweetId").delete(verifyJWT, deleteTweet)
router.route("/user/:userId").get(verifyJWT, getUserTweets)




export default router