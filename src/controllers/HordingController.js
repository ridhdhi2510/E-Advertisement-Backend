const hordingModel = require("../models/HordingModel");
const multer = require("multer");
const path = require("path");
const { deleteBookingsbyhordingId } = require("../controllers/BookingController");
// const cloudinaryUtil = require("../utils/cloudnaryUtil");
const cloudinaryUtil = require("../utils/CloudnaryUtil.js");
const { createActivity } = require('./ActivityController');

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

      try {
        await createActivity(
          'hording_added',
          req.body.userId,
          req.body.userName, // You'll need to pass this or fetch it
          savedHording._id,
          `New hoarding added by ${req.body.userName}`
        );
      } catch (activityError) {
        console.error('Failed to log hoarding added activity:', activityError);
        // Continue with the response even if activity logging fails
        // You might want to add this error to your response metadata
      }

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

    // Log activity
    try {
      await createActivity(
        'hording_updated',
        req.body.userId,
        req.body.userId?.name,
        req.params.id,
        `Hoarding updated by ${req.body.userName}`
      );
    } catch (activityError) {
      console.error('Activity logging failed:', activityError);
    }
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
// const deleteHording = async(req,res) => {
//   const deletedHording = await hordingModel.findByIdAndDelete(req.params.id)

//   res.json({
//     message : " hoarding removed successfully",
//     data : deletedHording
//   })
// }

const deleteHording = async(req,res) => {
  try {
    const hoardingId = req.params.id;

    // First cancel all associated bookings
    const cancellationResult = await deleteBookingsbyhordingId(hoardingId);
    console.log('Booking cancellation result:', cancellationResult);

    // Then delete the hoarding
    const deletedHoarding = await hordingModel.findByIdAndDelete(hoardingId);
    
    if (!deletedHoarding) {
      return res.status(404).json({
        success: false,
        message: "Hoarding not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hoarding deleted successfully",
      bookingsCancelled: cancellationResult.cancelled
    });

  } catch (error) {
    console.error('Error deleting hoarding:', error);
    return res.status(500).json({
      success: false,
      message: "Error deleting hoarding",
      error: error.message
    });
  }
} 
module.exports = { addHording, getAllHordings, addHordingWithFile , getAllHordingsByUserId, updateHording, getHordingById,getHordingsByLocation, deleteHording };
