import { asyncHandler } from "../utils/asyncHandler.js"
import { apiResponse } from "../utils/apiResponse.js"
import { apiError } from "../utils/apiError.js"
import { Subscription } from "../models/subscription.models.js"
import mongoose, { isValidObjectId, Types } from "mongoose"
import { User } from "../models/user.models.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const { userId } = req.user._id
    const isSubscribed = await Subscription.findOne({ subscriber: userId, channel: channelId });
    if (isSubscribed) {
        await Subscription.deleteOne({ subscriber: userId, channel: channelId });
        return res
            .status(200)
            .json(apiResponse(200, { isSubscribed: false }, "Subscription cancelled successfully"))

    }
    else {
        const subscription = await Subscription.create({ subscriber: userId, channel: channelId });
        return res
            .status(200)
            .json(new apiResponse(200, { isSubscribed: false }, "Channel subscribed successfully"));
    }
})
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    const channelSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscribers",
                foreignField: "_id",
                as: "subscribers",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribedToSubscriber"
                        }
                    },
                    {
                        $addFields: {
                            subscribedToSubscriber: {
                                $cond: {
                                    if: {
                                        $in: [
                                            mongoose.Types.ObjectId(channelId),
                                            "$subscribedToSubscriber.subscriber",
                                        ],
                                    },
                                    then: true,
                                    else: false,
                                },
                            },
                            subscribersCount: {
                                $size: "$subscribedToSubscriber"
                            }
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$subscribers"
        },
        {
            $project: {
                _id: 0,
                subscriber: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                    subscribedToSubscriber: 1,
                    subscribersCount: 1
                }
            }
        }
    ]);

    return res
        .status(200)
        .json(new apiResponse(200, channelSubscribers, "Fetched all the subscribers of the user"));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const subscribedChannels = await Subscription.aggregate([
        {
            $match: { subscriber: new mongoose.Types.ObjectId(subscriberId), }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannel",
                pipeline: [
                    {
                        $lookup: {
                            from: "videos",
                            localField: "_id",
                            foreignField: "owner",
                            as: "video"
                        }
                    },
                    {
                        $addFields: {
                            latestVideo: {
                                $last: "$videos"
                            }
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$subscribedChannel"
        },
        {
            $project: {
                _id: 0,
                subscribedChannel: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                    latestVideo: {
                        _id: 1,
                        "videoFile.url": 1,
                        "thumbnail.url": 1,
                        owner: 1,
                        title: 1,
                        description: 1,
                        duration: 1,
                        createdAt: 1,
                        views: 1
                    }
                }
            }
        }
    ])
    if (!subscribedChannels) throw new apiError(400, "Failed to fetched the channels");

    return res
        .status(200)
        .json(new apiResponse(200, subscribedChannels, "Subscribed Channels are fetched successfully"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}