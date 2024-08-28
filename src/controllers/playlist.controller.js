import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Playlist } from "../models/playlist.models.js"
import { Video } from "../models/video.models.js"
import mongoose, { isValidObjectId } from "mongoose"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    if (!name || !description) throw new apiError(400, "Both the fields are compulsory");
    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })
    if (!playlist) throw new apiError(400, "Failed to create a Playlist");
    return res
        .status(200)
        .json(new apiResponse(200, playlist, "Playlist created successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id
    if (!isValidObjectId(playlistId)) throw new apiError(400, "Invalid Playlist ID");
    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
            }
        },
        {
            $match: {
                "videos.isPublished": true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $addFields: {
                totalVideos: {
                    $size: "$videos"
                },
                totalViews: {
                    $sum: "$videos.views"
                },
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $project: {
                owner: 1,
                name: 1,
                description: 1,
                createdAt: 1,
                updatedAt: 1,
                totalVideos: 1,
                totalViews: 1,
                videos: {
                    _id: 1,
                    "thumbnail.url": 1,
                    "videoFile.url": 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    createdAt: 1,
                    views: 1,
                }
            }
        }
    ])
    if (playlist.length === 0) throw new apiError(400, "Failed to get the playlist ");
    return res
        .status(200)
        .json(new apiResponse(200, playlist[0], "Playlist fetched successfully"));
})


const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
    if (!isValidObjectId(userId)) throw new apiError(400, "Invalid UserId");

    const userPlaylists = await Playlist.aggregate([
        {
            $match: {
                owner: mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup: {
                from: 'videos',
                localField: "videos",
                foreignField: "_id",
                as: "videos",
            }
        },
        {
            $addFields: {
                totalVideos: {
                    $size: "$videos"
                },
                totalViews: {
                    $sum: "$videos.views"
                }
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                totalVideos: 1,
                totalViews: 1,
                updatedAt: 1
            }
        }
    ])

    if (userPlaylists.length === 0) throw new apiError(400, "Failed to fetched the user playlists");
    return res
        .status(200)
        .json(new apiResponse(200, userPlaylists[0], "Successfully fetched the user playlists"));

})


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params


    if (!videoId || !playlistId) throw new apiError(400, "All the fields are compulsory");

    if (!isValidObjectId(playlistId)) throw new apiError(400, "Invalid PlaylistId");
    if (!isValidObjectId(videoId)) throw new apiError(400, "Invalid videoId");

    const playList = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);

    if (playList.owner.toString() !== req.user?._id.toString() && video.owner.toString() !== req.user?._id.toString()) {
        throw new apiError(400, "Only the owner of the playlist or the owner of the video can add the video to the playlist");
    }


    if (!video) throw new apiError(400, "Failed to find the video");

    const alreadyExistingVideo = await Playlist.findOne({
        videos: {
            $elemMatch: {
                $eq: mongoose.Types.ObjectId(videoId)
            }
        }
    });
    if (alreadyExistingVideo) throw new apiError(400, "Video already exist in the Playlist");

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: {
                videos: videoId
            }
        },
        {
            new: true
        }
    )
    if (!updatedPlaylist) throw new apiError(400, "Failed to add the video to the play list");
    return res
        .status(200)
        .json(new apiResponse(200, updatedPlaylist, "Video added to the playlist successfully"))
})
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!videoId || !playlistId) throw new apiError(400, "All fields are compulsory");

    if (!isValidObjectId(playlistId)) throw new apiError(400, "Invalid Playlist ID");
    if (!isValidObjectId(videoId)) throw new apiError(400, "Invalid Video ID");

    const playList = await Playlist.findById(playlistId);
    if (!playList) throw new apiError(404, "Playlist not found");

    const video = await Video.findById(videoId);
    if (!video) throw new apiError(404, "Video not found");

    if (playList.owner.toString() !== req.user?._id.toString() && video.owner.toString() !== req.user?._id.toString()) {
        throw new apiError(403, "Only the owner of the playlist or the owner of the video can remove the video from the playlist");
    }

    const existingVideo = playList.videos.includes(mongoose.Types.ObjectId(videoId));
    if (!existingVideo) throw new apiError(404, "Video is not in the playlist");

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { videos: mongoose.Types.ObjectId(videoId) }
        },
        { new: true }
    );

    if (!updatedPlaylist) throw new apiError(500, "Failed to remove the video from the playlist");

    return res
        .status(200)
        .json(new apiResponse(200, updatedPlaylist, "Video removed successfully from the playlist"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) throw new apiError(400, "Invalid Playlist ID");

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new apiError(404, "Playlist not found");

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new apiError(403, "Only the playlist owner can delete the playlist");
    }

    await Playlist.findByIdAndDelete(playlistId);

    return res
        .status(200)
        .json({ message: "Playlist deleted successfully" });
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist
    if (!isValidObjectId(playlistId)) throw new apiError(400, "Invalid Playlist Id");

    if (!name || !description) throw new apiError(400, "All the fields are compulsory");
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new apiError(400, "Failed to load the playlist");
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlist?._id,
        {
            $set: {
                name: name,
                description: description
            }
        },
        {
            new: true
        }
    )
    if (!updatedPlaylist) throw new apiError(400, "Failed to updated the playlist");

    return res
        .status(200)
        .json(new apiResponse(200, updatedPlaylist, "Updated the playlist successfully"));
})

export {
    createPlaylist,
    getPlaylistById,
    getUserPlaylists,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
