import mongoose, { isValidObjectId, mongo } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Video } from "../models/video.models.js"
import { Subscription } from "../models/subscription.models.js"
import { Like } from "../models/likes.models.js"
import { Comment } from "../models/comment.models.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    // Fetch total subscribers
    const totalSubscribersAgg = await Subscription.aggregate([
        {
            $match: { channel: mongoose.Types.ObjectId(userId) }
        },
        {
            $group: {
                _id: null,
                totalSubscribers: { $sum: 1 }
            }
        }
    ]);

    // Fetch total videos, likes, and views
    const totalVideosAgg = await Video.aggregate([
        {
            $match: { owner: new mongoose.Types.ObjectId(userId) }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                postLikes: { $size: "$likes" }
            }
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: "$postLikes" },
                totalVideos: { $sum: 1 }
            }
        },
        {
            $project: {
                totalVideos: 1,
                totalLikes: 1,
                totalViews: 1,
            }
        }
    ]);

    const totalSubscribers = totalSubscribersAgg.length > 0 ? totalSubscribersAgg[0].totalSubscribers : 0;
    const totalVideosData = totalVideosAgg.length > 0 ? totalVideosAgg[0] : { totalVideos: 0, totalLikes: 0, totalViews: 0 };

    const channelStats = {
        totalSubscribers,
        totalVideos: totalVideosData.totalVideos,
        totalLikes: totalVideosData.totalLikes,
        totalViews: totalVideosData.totalViews,
    };

    return res
        .status(200)
        .json(new apiResponse(200, channelStats, "Channel stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // Get all the videos uploaded by the channel
    const userId = req.user?._id;
    if (!isValidObjectId(userId)) throw new apiError(400, "Invalid UserId");

    const channelVideos = await Video.aggregate([
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
                as: "owner",
                pipeline: [
                    { $project: { username: 1, 'avatar.url': 1 } }
                ]
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $addFields: {
                totalLikes: { $size: "$likes" },
                totalComments: { $size: "$comments" },
                createdAt: { $dateToParts: { date: "$createdAt" } }
            }
        },
        {
            $project: {
                title: 1,
                "videoFile.url": 1,
                "thumbnail.url": 1,
                description: 1,
                duration: 1,
                totalLikes: 1,
                totalComments: 1,
                isPublished: 1,
                createdAt: { year: 1, month: 1, day: 1 },
                owner: { $arrayElemAt: ["$owner", 0] }
            }
        }
    ]);

    if (channelVideos.length === 0) throw new apiError(400, "There are no videos in the Channel");

    return res
        .status(200)
        .json(new apiResponse(200, channelVideos, "Channel Videos fetched Successfully"));
});


export {
    getChannelStats,
    getChannelVideos
}