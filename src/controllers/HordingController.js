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
const getAllHordingsByUserId = async (req, res) => {
  try {
    const hording = await hordingModel.find({ userId: req.params.userId }).populate("stateId cityId areaId userId");

    if (hording.length === 0) {
      res.status(404).json({ message: "No hordings found" });
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


//add hording with file
// const addHordingWithFile = async (req, res) => {
//   upload(req, res, async (err) => {
//     if (err) {
//       res.status(500).json({
//         message: err.message,
//       });
//     } 

//     else {
//       // database data store
//       //cloundinary

//       const cloundinaryResponse = await cloudinaryUtil.uploadFileToCloudinary(req.file);
//       console.log(cloundinaryResponse);
//       console.log(req.body);

//       //store data in database
//       req.body.hordingURL = cloundinaryResponse.secure_url
//       const savedHording = await hordingModel.create(req.body);

//       res.status(200).json({
//         message: "hording saved successfully",
//         data: savedHording
//       });
//     }
//   });
// };
const addHordingWithFile = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: "File upload error", error: err.message });
    }

    try {
      // Check if file is uploaded
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Upload file to Cloudinary
      const cloudinaryResponse = await cloudinaryUtil.uploadFileToCloudinary(req.file);
      // console.log("Cloudinary Response:", cloudinaryResponse);
      // console.log("Request Body:", req.body);

      // Ensure Cloudinary upload was successful
      if (!cloudinaryResponse || !cloudinaryResponse.secure_url) {
        return res.status(500).json({ message: "Cloudinary upload failed" });
      }

      // Store image URL in request body
      req.body.hordingURL = cloudinaryResponse.secure_url;

      // Save hording data to the database
      const savedHording = await hordingModel.create(req.body);

      res.status(200).json({
        message: "Hording saved successfully",
        data: savedHording,
      });

    } catch (error) {
      console.error("Error in addHordingWithFile:", error);
      res.status(500).json({ message: "Server error", error: error.message });
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
const getHordingById = async (req, res) => {
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

//delete api
const deleteHording = async(req,res) => {
  const deletedHording = await hordingModel.findByIdAndDelete(req.params.id)

  res.json({
    message : " hoarding removed successfully",
    data : deletedHording
  })
}


module.exports = { addHording, getAllHordings, addHordingWithFile , getAllHordingsByUserId, updateHording, getHordingById,getHordingsByLocation, deleteHording };
