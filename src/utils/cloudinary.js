import { v2 as cloudinary } from "cloudinary"
import { Console } from "console";
import { fs } from "fs" //fs means file system we get this from the nodeJs 
// we use fs when we want to manage the file system and to do operations like read write open close etc 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        console.log("file uploaded succesfully->", response.url)
        return response

    } catch (error) {
        fs.unlinkSync(localFilePath) //this will remove the locally saved temproary file on the server
        // console.log("error while uploading file on cloudinary->", error)
        return null
    }
}

export {uploadCloudinary}