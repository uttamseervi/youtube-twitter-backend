import { v2 as cloudinary } from "cloudinary"
import { Console, log } from "console";
import { response } from "express";
import fs from "fs" //fs means file system we get this from the nodeJs 
// we use fs when we want to manage the file system and to do operations like read write open close etc 


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});




const uploadonCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        /*
        console.log("Here is the response from cloudinary",response)
        console.log("here is the url of the response: ",response.url)
        Here is the response from cloudinary {
            asset_id: 'b5e9f64ea3f37ff8361a069c04e8a405',
            public_id: 'j2ikgrdgkoeevmezyqkc',
            version: 1716395275,
            version_id: '969d5dd4ee44f06ef896c4d44caab27d',
            signature: '16e7de9fa1c102587a711cb3c5586426f3a031b0',
            width: 1920,
            height: 1080,
            format: 'jpg',
            resource_type: 'image',
            created_at: '2024-05-22T16:27:55Z',
            tags: [],
            bytes: 376150,
            type: 'upload',
            etag: 'e28226527f92b4e435821e2b9f500d5b',
            placeholder: false,
            url: 'http://res.cloudinary.com/duphxfug7/image/upload/v1716395275/j2ikgrdgkoeevmezyqkc.jpg',
            secure_url: 'https://res.cloudinary.com/duphxfug7/image/upload/v1716395275/j2ikgrdgkoeevmezyqkc.jpg',
            folder: '',
            original_filename: 'WIN_20230329_14_32_41_Pro',
            api_key: '728546593821751'
          }
          here is the url of the response:  http://res.cloudinary.com/duphxfug7/image/upload/v1716395275/j2ikgrdgkoeevmezyqkc.jpg 
          file uploaded successfully-> http://res.cloudinary.com/duphxfug7/image/upload/v1716395275/j2ikgrdgkoeevmezyqkc.jpg      
          Here is the response from cloudinary {
            asset_id: 'ac3c27cc058f098c09edb714cf2c6bdd',
            public_id: 'lihhqho8qz6sb0z13r7i',
            version: 1716395280,
            version_id: '50affcccd8ce577d1184573f8c5fedcd',
            signature: '0f218d9f3f1a8f9f15c9d043f05f6fa24521c023',
            width: 1920,
            height: 1080,
            format: 'jpg',
            resource_type: 'image',
            created_at: '2024-05-22T16:28:00Z',
            tags: [],
            bytes: 1105101,
            type: 'upload',
            etag: 'e452978be6c211b0c8c92d79d173f5ca',
            placeholder: false,
            url: 'http://res.cloudinary.com/duphxfug7/image/upload/v1716395280/lihhqho8qz6sb0z13r7i.jpg',
            secure_url: 'https://res.cloudinary.com/duphxfug7/image/upload/v1716395280/lihhqho8qz6sb0z13r7i.jpg',
            folder: '',
            original_filename: 'pxfuel (1)',
            api_key: '728546593821751'
          }
          here is the url of the response:  http://res.cloudinary.com/duphxfug7/image/upload/v1716395280/lihhqho8qz6sb0z13r7i.jpg 
          file uploaded successfully-> http://res.cloudinary.com/duphxfug7/image/upload/v1716395280/lihhqho8qz6sb0z13r7i.jpg      
          */

        console.log("file uploaded successfully->", response.url)
        fs.unlinkSync(localFilePath)
        return response

    } catch (error) {
        fs.unlinkSync(localFilePath) //this will remove the locally saved temproary file on the server
        // console.log("error while uploading file on cloudinary->", error)
        return null
    }
}
const deleteOnCloudinary = async (public_id, resource_type = "image") => {
    try {
        if (!public_id) return null;

        //delete file from cloudinary
        const result = await cloudinary.uploader.destroy(public_id, {
            resource_type: `${resource_type}`
        });
    } catch (error) {
        return error;
        console.log("delete on cloudinary failed", error);
    }
};

export { uploadonCloudinary, deleteOnCloudinary }