import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js"
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    if (content == "" || content.trim() == "" || !content) throw new apiError(400, "content is required");
    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })
    if (!tweet) throw new apiError(500, "Failed to create the tweet please try again later");
    return res
        .status(200)
        .json(new apiResponse(200, tweet, "Tweet created Successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { tweetId } = req.params;
    if (!content) throw new apiError(400, "Content is required");
    if (!isValidObjectId(tweetId)) throw new apiError(400, "Invalid tweetId");

    const tweet = await Tweet.findById(tweetId)
    console.log(req.user._id)
    if (tweet.owner?._id.toString() !== req.user?._id.toString()) throw new apiError(400, "Only Owner can edit the tweet");

    const newTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:
            {
                content
            }
        },
        {
            new: true
        }
    );
    if (!newTweet) throw new apiError(500, "Failed to update the tweet Try again later");
    return res
        .status(200)
        .json(new apiResponse(200, newTweet, "Tweet updated successfully"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!isValidObjectId(tweetId)) throw new apiError(400, "Invalid tweetId");
    const userId = req.user._id;
    if (!isValidObjectId(userId)) throw new apiError(400, "Invalid userId");

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) throw new apiError(400, "Tweet not found");
    if (tweet.owner?._id.toString() !== req.user?._id.toString()) throw new apiError(400, "Only owner can delete the Tweets");

    await Tweet.findByIdAndDelete(tweetId);


    return res
        .status(200)
        .json(new apiResponse(200, {}, "Tweet Deleted Successfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) throw new apiError(400, "Invalid User Id");
    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweets",
                as: "likeDetails",
                pipeline: [
                    {
                        $project: {
                            likedBy: 1,

                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likeDetails"
                },
                ownerDetails: {
                    $first: "$ownerDetails"
                },
                isLiked: {
                    $cond: {
                        if: {
                            $in: [req.user._id, "$likeDetails.likedBy"]
                        },
                        then: true,
                        else: false

                    }
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                content: 1,
                likesCount: 1,
                ownerDetails: 1,
                createdAt: 1,
                isLiked: 1,
            }
        }
    ])
    if (!tweets) throw new apiError(400, "Failed to fetch the tweets");


    return res
        .status(200)
        .json(new apiResponse(200, tweets, "Tweets fetched successfully"));
})




export { createTweet, updateTweet, deleteTweet, getUserTweets }