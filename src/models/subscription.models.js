import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, //for the one who is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, //for the one whom is the subscriber is subscribing
        ref: "User"
    }
},{timestamps:true})

export const Subscription = mongoose.model("Subscription", subscriptionSchema,)