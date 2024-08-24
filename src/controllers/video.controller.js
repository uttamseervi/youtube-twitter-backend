import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js"
import { Like } from "../models/likes.models.js"
import { Comment } from "../models/comment.models.js"
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { uploadonCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import { isValidObjectId } from "mongoose";




const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const publishVideo = asyncHandler(async (req, res) => {
    /*TO PUBLISH THE VIDEO FIRST I NEED TO GET THE VIDEO FROM THE LOCAL STORAGE AND THEN UPLOAD IT ON CLOUDINARY*/

    const { title, description } = req.body
    // console.log("This is description", description)
    // console.log("This is title", title)

    if (!title && !description) throw new apiError(400, "ALL THE FIELDS ARE COMPULSORY");
    console.log("the req.files is", req.files)
    const videoFileLocalPath = req.files?.videoFile[0].path;
    const thumbnailLocalPath = req.files?.thumbnail[0].path;
    console.log("videofile:", videoFileLocalPath)
    console.log("thumbnail:", thumbnailLocalPath)

    if (!videoFileLocalPath) throw new apiError(400, "VIDEO FILE IS REQUIRED");
    if (!thumbnailLocalPath) throw new apiError(400, "THUMBNAIL FILE IS REQUIRED");

    const thumbnail = await uploadonCloudinary(thumbnailLocalPath);
    const videoFile = await uploadonCloudinary(videoFileLocalPath);
    console.log("the output of cloudianry video file is :", videoFile)

    if (!videoFile) throw new apiError(400, "VIDEO FILE NOT FOUND");
    if (!thumbnail) throw new apiError(400, "THUMBNAIL FILE NOT FOUND");
    // console.log("THIS IS THE VIDEO FILE FROM THE CLOUDINARY ", videoFile)

    const video = await Video.create({
        title,
        description,
        videoFile: {
            url: videoFile.url,
            public_id: videoFile.public_id,
        },
        duration: videoFile?.duration,
        thumbnail: {
            url: thumbnail.url,
            public_id: thumbnail.public_id,
        },
        owner: req.user?._id,
        isPublished: false,
    })
    if (!video) throw newApiError(400, "failed to create the element in the database");
    const uploadedVideo = await Video.findById(video._id);
    if (!uploadedVideo) throw new apiError(400, "Video Upload failed Please try again later...!!");

    return res
        .status(200)
        .json(new apiResponse(200, video, "Video uploaded successFully"));
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) throw new apiError(400, "Invalid videoID");
    const video = await Video.findById(videoId);
    if (!video) throw new apiError(400, "Video not found");
    if (video.owner.toString() !== req.user?._id) throw new apiError(400, "only owner can delete the video");
    const deletedVideo = await Video.findByIdAndDelete(video?._id);
    if (!deletedVideo) throw new apiError(400, "Failed to delete the video please try again later");

    await deleteOnCloudinary(video.videoFile.public_id, "video")
    await deleteOnCloudinary(video.thumbnail.public_id)

    await Like.deleteMany({ video: videoId })
    await Comment.deleteMany({ video: videoId })

    return res
        .status(200)
        .json(new apiResponse(200, {}, "Video delete successfully"));

})
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) throw new apiError(400, "Invalid video ID");

    const video = await Video.findById(videoId);
    if (!video) throw new apiError(400, "Failed to load the video");

    const { title, description } = req.body;
    if (!title || !description) throw new apiError(400, "Fields should not be empty");

    if (video.owner.toString() !== req.user?._id.toString()) throw new apiError(400, "Only the owner can update the video details");

    const oldThumbnail = video.thumbnail?.public_id;

    // Handle thumbnail upload
    const thumbnailLocalPath = req.file?.path; // Assuming single file upload
    let thumbnailData = video.thumbnail; // Default to existing thumbnail data

    if (thumbnailLocalPath) {
        const thumbnailURL = await uploadonCloudinary(thumbnailLocalPath);
        if (!thumbnailURL) throw new apiError(400, "Failed to upload the thumbnail");
        thumbnailData = { public_id: thumbnailURL.public_id, url: thumbnailURL.url };
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title.trim(),
                description: description.trim(),
                thumbnail: thumbnailData
            }
        },
        { new: true }
    );
    if (!updatedVideo) throw new apiError(400, "Failed to update the video");

    if (thumbnailLocalPath) {
        await deleteOnCloudinary(oldThumbnail);
    }

    return res.status(200).json(new apiResponse(200, updatedVideo, "Video details updated successfully"));
});
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) throw new apiError(400, "Invalid Video id");

    const video = await Video.findById(videoId);
    if (!video) throw new apiError(400, "Failed to load the video");

    if (video.owner.toString() !== req.user?._id.toString()) throw new apiError(400, "Only owner can toggle the publish status");
    
    const videoStatus = video.isPublished;
    const videoPublishToggle = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !videoStatus
            }
        },
        {
            new: true,
        }
    )
    if (!videoPublishToggle) throw new apiError(400, "Failed to toggle the Publish");
    return res
        .status(200)
        .json(new apiResponse(200, videoPublishToggle, "Video publish toggled successfully"))
})


export { publishVideo, deleteVideo, updateVideo, togglePublishStatus }