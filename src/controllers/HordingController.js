const hordingModel = require("../models/HordingModel");
const multer = require("multer");
const path = require("path");
const mailUtil = require("../utils/MailUtil.js");

const { deleteBookingsbyhordingId } = require("../controllers/BookingController");

const cloudinaryUtil = require("../utils/CloudnaryUtil.js");
const { createActivity } = require('./ActivityController');
const UserModel = require("../models/UserModel.js");

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

//Add Hording with file
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
        const user = await UserModel.findById(req.body.userId).select("name");
        await createActivity(
          'hording_added',
          req.body.userId,
          user.name,
          savedHording._id,
          `New hoarding added by ${user.name}`
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
      const user = await UserModel.findById(req.body.userId).select("name");
      await createActivity(
        'hording_updated',
        req.body.userId,
        user.name,
        req.params.id,
        `Hoarding updated by ${user.name}`
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
    // console.log(req.params)
    const hoardingId = req.params.id;
    const hording = await hordingModel.findById(hoardingId)
          .populate("userId", "email name") // Only get user's email
          .exec()

          // Log the deletion activity BEFORE deleting
      try {
        const activity = await createActivity(
          'hording_deleted',
          hording.userId._id,
          hording.userId.name,
          hoardingId,
          `Hoarding deleted by ${hording.userId.name}`
        );
        console.log("Hoarding deletion activity logged:", activity);
      } catch (activityError) {
        console.error('Failed to log deleted hoarding activity:', activityError);
      }


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
    if (hording.userId?.email) {
          const emailContent = `<!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { color: #c0392b; border-bottom: 1px solid #eee; padding-bottom: 10px; }
              .content { margin: 20px 0; }
              .penalty-box { background: #fbe9e7; padding: 15px; border-radius: 5px; margin: 20px 0; color: #c0392b; }
              .footer { font-size: 0.9em; color: #7f8c8d; border-top: 1px solid #eee; padding-top: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>Notice: Hoarding Removed </h2>
            </div>
            
            <div class="content">
              <p>Dear ${hording.userId.name || "Agency"},</p>
              
              <p>We noticed that your hoarding (ID: <strong>${hoardingId}</strong>) has been removed while it still had active bookings.</p>
              
              <div class="penalty-box">
                <h3>Penalty Notice</h3>
                <p>This action violates our platform policy and may have caused inconvenience to our users. A penalty is applicable for this violation.</p>
                <p><strong>Action Required:</strong> Please contact our support team immediately to resolve this and pay the applicable penalty.</p>
              </div>
        
              <p>If this was done by mistake, please inform us at the earliest to avoid further consequences.</p>
            </div>
            
            <div class="footer">
              <p>Thank you for your cooperation.</p>
              <p><strong>The Take Outdoors Team</strong></p>
            </div>
          </body>
          </html>
          `;
    
          await mailUtil.sendingMail(
            hording.userId.email,
            "Hoarding Cancellation Confirmation",
            emailContent
          );
          console.log("Cancellation email sent to:", hording.userId.email);
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
