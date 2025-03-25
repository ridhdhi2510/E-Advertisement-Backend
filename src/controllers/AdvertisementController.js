const advertisementModel = require("../models/AdvertisementModel")
const multer = require("multer");
const path = require("path");
const cloudinaryUtil = require("../utils/CloudnaryUtil");

//add
//addwithfile
//getall
//getallbyuserId

// //storage engine
const storage = multer.diskStorage({
  // destination: "./uploads",
  filename: function (req, file, cb) {
     cb(null, file.originalname);
  },
});

// //multer object....
const upload = multer({
  storage: storage,
  //fileFilter:
}).single("image");

const addAdvertisment = async(req,res)=>{
    try{
        const createadvertisment = await advertisementModel.create(req.body)
        res.status(201).json({
            message:"Advertisement added successfully...",
            data: createadvertisment
        })
    }
    catch(err){
        res.status(500).json({
            message: err
        })
    }
}

const addAdvertismentwithFile = async(req,res)=>{
    upload(req, res, async(err)=>{
        if(err){
            res.status(500).json({
                message: err.message
            })
        }
        else{
            const cloundinaryResponse = await cloudinaryUtil.uploadFileToCloudinary(req.file);
            console.log(cloundinaryResponse);
            console.log(req.body);
            
            req.body.fileURL = cloundinaryResponse.secure_url
            const savedAdvertisment = await advertisementModel.create(req.body)

            res.status(200).json({
                message: "Advertisment saved successfully",
                data: savedAdvertisment
            })
        }
    })
}

const getAllAdvertisment = async(req,res)=>{
    try{
        const showadvertisments = await advertisementModel.find().populate("stateId cityId areaId userId")
        if(showadvertisments.length === 0){
            res.status(404).json({
                message: "No Advertisments found"
            })
        }
        else{
            res.status(200).json({
                message: "All Advertisments fetched...",
                data: showadvertisments
            })
        }
    }
    catch(err){
        res.status(500).json({
            message: err
        })
    }
}

const getAllAdvertismentbyuserId = async(req,res)=>{
    try{
        const showadvertismentsbyuserId = await advertisementModel.find({userId: req.params.userId}).populate("stateId cityId areaId userId")
        if(showadvertismentsbyuserId.length === 0){
            res.status(404).json({
                message: "No Advertisments found"
            })
        }
        else{
            res.status(200).json({
                message: "All Advertisments according userId fetched...",
                data: showadvertismentsbyuserId
            })
        }
    }
    catch(err){
        res.status(500).json({
            message: err
        })
    }
}

module.exports = {
    addAdvertisment,
    getAllAdvertisment,
    getAllAdvertismentbyuserId,
    addAdvertismentwithFile
}