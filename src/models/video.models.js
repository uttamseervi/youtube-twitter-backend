import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
// the above library allows us to write the aggregation queries 


const videoSchema = new mongoose.Schema({
    videoFile: {
        type: {
            url: String,
            public_id: String
        },
        required: true,
    },
    thumbnail: {
        type: {
            url: String,
            public_id: String
        },
        required: true,
    },
    description: {
        type: String,
        index: 1,
        required: true,
    },
    title: {
        type: String,
        index: 1,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true })
videoSchema.plugin(mongooseAggregatePaginate)
videoSchema.index({ title: "text", description: "text" })
export const Video = mongoose.model("Video", videoSchema)