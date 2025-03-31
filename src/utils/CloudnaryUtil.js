const cloundinary = require("cloudinary").v2;


const uploadFileToCloudinary = async (file) => {

    if (!file) {
        throw new Error("File is undefined or null");
    }

    //conif
        cloundinary.config({
        cloud_name:"dqy3m0pfy",
        api_key:"937188966552947",
        api_secret:"AiTUMZIu9OoH_7mLstTH7aYkkew"
    })

    const cloundinaryResponse = await cloundinary.uploader.upload(file.path);
    return cloundinaryResponse;

};
module.exports = {
    uploadFileToCloudinary
}