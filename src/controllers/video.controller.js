import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js"
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishVideo = asyncHandler(async (req, res) => {
    /*TO PUBLISH THE VIDEO FIRST I NEED TO GET THE VIDEO FROM THE LOCAL STORAGE AND THEN UPLOAD IT ON CLOUDINARY*/

    const { title, description } = req.body
    console.log("This is description", description)
    console.log("This is title", title)

    if (!title && !description) throw new apiError(400, "ALL THE FIELDS ARE COMPULSORY");
    const videoFileLocalPath = req.files?.videoFile[0].path;
    const thumbnailLocalPath = req.files?.thumbnail[0].path;
    console.log("videofile:", videoFileLocalPath)
    console.log("thumbnail:", thumbnailLocalPath)

    if (!videoFileLocalPath) throw new apiError(400, "VIDEO FILE IS REQUIRED");
    if (!thumbnailLocalPath) throw new apiError(400, "THUMBNAIL FILE IS REQUIRED");

    const thumbnail = await uploadonCloudinary(thumbnailLocalPath);
    const videoFile = await uploadonCloudinary(videoFileLocalPath);

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

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId._id);
    if (!video) throw new apiError(400, "VIDEO NOT FOUND");
})



export { getAllVideos, publishVideo }