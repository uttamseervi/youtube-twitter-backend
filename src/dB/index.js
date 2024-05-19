// import mongoose from "mongoose";
// import { DB_NAME } from "../constant.js"

// const dbConnect = async () => {
//     try {
//         const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         console.log(`MongoDB connected and the DB HOST IS ${connectionInstance.connection.host}`)
        
//     }
//     catch (error) {
//         // throw error
//         console.log("MongoDB error", error)
//         process.exit(1);

//     }
// }
// export default dbConnect

import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}

export default connectDB