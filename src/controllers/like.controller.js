import { Like } from "../models/likes.models.js"
import { apiResponse } from "../utils/apiResponse.js"
import { apiError } from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import mongoose, { isValidObjectId, mongo } from "mongoose"


const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user?._id;

    if (!videoId || !isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid Video ID");
    }

    const likedAlready = await Like.findOne({
        video: videoId,
        likedBy: userId
    });

    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready._id);
        return res
            .status(200)
            .json(new apiResponse(200, { isLiked: false }, "Unliked the video"));
    } else {
        await Like.create({
            video: videoId,
            likedBy: userId
        });
        return res
            .status(200)
            .json(new apiResponse(200, { isLiked: true }, "Video liked successfully"));
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user?._id;
    if (!commentId || !isValidObjectId(commentId)) throw new apiError(400, "Invalid Comment ID");
    const likedAlready = await Like.findOne({
        comment: commentId,
        likedBy: userId
    })
    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready._id)
        return res
            .status(200)
            .json(new apiResponse(200, { isLiked: false }, "Comment unLiked Successfully"));
    }
    else {
        await Like.create({
            comment: commentId,
            likedBy: userId
        })
        return res
            .status(200)
            .json(new apiResponse(200, { isLiked: true }, "Comment liked Successfully"));
    }
})
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user?._id
    if (!tweetId || !isValidObjectId(tweetId)) throw new apiError(400, "Invalid Tweet Id");
    const likedAlready = await Like.findOne(
        {
            tweets: tweetId,
            likedBy: userId,
        }
    )
    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready._id);
        return res
            .status(200)
            .json(200, { isLiked: false }, "Tweet unLiked Successfully");
    }
    else {
        await Like.create({
            tweets: tweetId,
            likedBy: userId,
        })
        return res
            .status(200)
            .json(200, { isLiked: true }, "Tweet liked successfully");
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails"
                        },
                    },
                    {
                        $unwind: "$ownerDetails"
                    }
                ]
            }
        },
        {
            $unwind: "$videoDetails"
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                _id: 0,
                likedVideo: {
                    _id: 1,
                    "videoFile.url": 1,
                    "thumbnail.url": 1,
                    owner: 1,
                    title: 1,
                    description: 1,
                    views: 1,
                    duration: 1,
                    createdAt: 1,
                    isPublished: 1,
                },
                ownerDetails: {
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                },
            },
        }
    ])

    if (!likedVideos) throw new apiError(400, "Failed to fetch the liked Videos");
    return res
        .status(200)
        .json(new apiResponse(200, likedVideos[0], "Fetched all the liked videos"));
})


export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}