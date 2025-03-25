const hordingModel = require("../models/HordingModel");
const multer = require("multer");
const path = require("path");
const cloudinaryUtil = require("../utils/CloudnaryUtil");

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


//add hording
const addHording = async (req, res) => {
  try {
    const savedHording = await hordingModel.create(req.body);
    res.status(201).json({
      message: "Hording added successfully",
      data: savedHording,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//get all hording
const getAllHordings = async (req, res) => {
  try {
    const hordings = await hordingModel
      .find()
      .populate("stateId cityId areaId userId");
    if (hordings.length === 0) {
      res.status(404).json({ message: "No hordings found" });
    } else {
      res.status(200).json({
        message: "Hording found successfully",
        data: hordings,
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//get all hording by user id
const getAllHordingsByUserId = async (req , res) => {
  try{
    const hording = await hordingModel.find({userId: req.params.userId}).populate("stateId cityId areaId userId");

    if (hording.length === 0) {
      res.status(404).json({ message: "No hordings found" });
    } else {
      res.status(200).json({
        message: "Hording found successfully",
        data: hording,
      });
    }
  }catch(err){
    res.status(500).json({ message: err.message });
  }
}


//add hording with file
const addHordingWithFile = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      res.status(500).json({
        message: err.message,
      });
    } else {
      // database data store
      //cloundinary

      const cloundinaryResponse = await cloudinaryUtil.uploadFileToCloudinary(req.file);
      console.log(cloundinaryResponse);
      console.log(req.body);

      //store data in database
      req.body.hordingURL = cloundinaryResponse.secure_url
      const savedHording = await hordingModel.create(req.body);

      res.status(200).json({
        message: "hording saved successfully",
        data: savedHording
      });
    }
  });
};

//update hording
  const updateHording = async (req, res) => {
    //update tablename set  ? where id = ?
    //update new data -->req.body
    //id -->req.params.id
  
    try {
      const updatedHording = await hordingModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.status(200).json({
        message: "Hording updated successfully",
        data: updatedHording,
      });
    } catch (err) {
      res.status(500).json({
        message: "error while update hording",
        err: err,
      });
    }
  };

//get hording by Id
  const getHordingById= async(req,res)=>{
    try {
      const hording = await hordingModel.findById(req.params.id);
      if (!hording) {
        res.status(404).json({ message: "No hording found" });
      } else {
        res.status(200).json({
          message: "Hording found successfully",
          data: hording,
        });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

//get hording by location
const getHordingsByLocation = async (req, res) => {
  try {
    const { stateId, cityId, areaId } = req.query;
    const query = {};
    if (stateId) query.stateId = stateId;
    if (cityId) query.cityId = cityId;
    if (areaId) query.areaId = areaId;

    const hordings = await hordingModel.find(query)
      .populate("stateId", "name")
      .populate("cityId", "name")
      .populate("areaId", "name");

    res.status(200).json({ message: "Filtered hoardings fetched", data: hordings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = { addHording, getAllHordings, addHordingWithFile , getAllHordingsByUserId, updateHording, getHordingById,getHordingsByLocation };