import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Comment } from "../models/comment.models.js"
import { Video } from '../models/video.models.js'
import { isValidObjectId, mongo } from "mongoose";

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new apiError(400, "Content is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new apiError(404, "Video not found");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    });

    if (!comment) {
        throw new apiError(500, "Failed to add comment please try again");
    }

    return res
        .status(201)
        .json(new apiResponse(201, comment, "Comment added successfully"));
});
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body
    if (!isValidObjectId(commentId)) throw new apiError(400, "Invalid comment Id");
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    )
    if (!updatedComment) throw new apiError(404, "Comment not found");
    return res
        .status(200)
        .json(new apiResponse(200, updateComment, "Comment updated Successfully"));
})

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query
    const comments = await Comment.aggregate([
        {
            $match: {
                video: mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner'
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                owner: {
                    $first: "$owner"
                },
                isLiked: {
                    $cond: {
                        if: { in: ["req.user?._id", "likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }

        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                likesCount: 1,
                owner: {
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1
                },
                isLiked: 1
            }
        }
    ])

})
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId)
    if (!comment) throw new apiError(404, "Comment not found");
    if (comment.owner.toString() !== req.user?._id.toString()) {
        throw new apiError(403, "You are not the owner of this comment");
    }
    await Comment.findByIdAndDelete(
        commentId
    )
    await Like.deleteMany({
        comment: commentId,
        likedBy: req.user?._id
    })
    return res
        .status(200)
        .json(new apiResponse(200, {}, "Comment deleted successfully"));
})


export {
    addComment,
    updateComment,
    getVideoComments,
    deleteComment
}
