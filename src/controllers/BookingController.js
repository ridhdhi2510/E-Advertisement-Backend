const BookingModel = require("../models/BookingModel");
const multer = require("multer");
const cloudinaryUtil = require("../utils/cloudnaryUtil");
const { getDatesInRange } = require('../utils/dateUtil');
const mailUtil = require("../utils/MailUtil.js"); 

// Multer storage configuration
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
 },
});
const upload = multer({ storage: storage }).single("adFile");


// Add booking
// const addBooking = async (req, res) => {
//   upload(req, res, async (err) => {
//     if (err) {
//       return res.status(500).json({ message: err.message });
//     }

//     try {
//       const { adName, adDescription, startDate, endDate, totalCost, websiteProductUrl, userId, hordingId} = req.body;
//       // const userId = req.headers["userid"];
//       // const hordingId = req.headers["hordingid"];
      
//       // if (!userId || !hordingId) {
//       //   return res.status(400).json({ message: "User ID and Hoarding ID are required!" });
//       // }
      
//       let adFileUrl = null;
//       if (req.file) {
//         const cloudinaryResponse = await cloudinaryUtil.uploadFileToCloudinary(req.file);
//         adFileUrl = cloudinaryResponse.secure_url;
//       }
//       if (!userId || !hordingId || !startDate || !endDate || !adName || !adDescription || !totalCost) {
//         return res.status(400).json({ message: "Missing required booking fields" });
//       }
      
//       const newBooking = await BookingModel.create({
//         hordingId,
//         userId,
//         adName,
//         adDescription,
//         adFile: adFileUrl,
//         websiteProductUrl,
//         startDate,
//         endDate,
//         totalCost,
//       });
      
//       res.status(201).json({ message: "Booking created successfully", data: newBooking });
//     } catch (error) {
//       res.status(500).json({ message: "Error adding booking", error: error.message });
//     }
//   });
// };
const addBooking = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    try {
      console.log("Incoming booking form:", req.body);
      console.log("Uploaded file info:", req.file);

      const {
        adName,
        adDescription,
        startDate,
        endDate,
        totalCost,
        websiteProductUrl,
        userId,
        hordingId, // ✅ FIXED typo from 'hordingId'
      } = req.body;

      // ✅ Validate required fields
      if (
        !userId ||
        !hordingId ||
        !startDate ||
        !endDate ||
        !adName ||
        !adDescription ||
        !totalCost
      ) {
        return res.status(400).json({
          message: "Missing required booking fields",
        });
      }

      // ✅ Upload to Cloudinary if file is present
      let adFileUrl = null;
      if (req.file) {
        const cloudinaryResponse = await cloudinaryUtil.uploadFileToCloudinary(req.file);
        console.log("Cloudinary Upload Response:", cloudinaryResponse);
        adFileUrl = cloudinaryResponse.secure_url;
      }

      // ✅ Create booking in DB
      const newBooking = await BookingModel.create({
        hordingId,
        userId,
        adName,
        adDescription,
        adFile: adFileUrl,
        websiteProductUrl,
        startDate,
        endDate,
        totalCost,
      });

      res.status(201).json({
        message: "Booking created successfully",
        data: newBooking,
      });

    } catch (error) {
      console.error("Booking creation error:", error);
      res.status(500).json({
        message: "Error adding booking",
        error: error.message,
      });
    }
  });
};

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await BookingModel.find().populate("hordingId userId");
    res.status(200).json({ message: "Bookings fetched successfully", data: bookings });
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error: error.message });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const booking = await BookingModel.findById(req.params.id).populate("hordingId userId");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ message: "Booking found successfully", data: booking });
  } catch (error) {
    res.status(500).json({ message: "Error fetching booking", error: error.message });
  }
};

// Get bookings by user ID
const getBookingsByUserId = async (req, res) => {
  try {
    const bookings = await BookingModel.find({ userId: req.params.userId }).populate("hordingId");
    res.status(200).json({ message: "Bookings fetched successfully", data: bookings });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user bookings", error: error.message });
  }
};

// Update booking
const updateBooking = async (req, res) => {
  try {
    const updatedBooking = await BookingModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ message: "Booking updated successfully", data: updatedBooking });
  } catch (error) {
    res.status(500).json({ message: "Error updating booking", error: error.message });
  }
};

// Delete booking by id + half refund mail
// const deleteBooking = async (req, res) => {
//   try {
//     const bookingdemo = await BookingModel.findById(req.params.id).populate("userId")
//     const deletedBooking = await BookingModel.findByIdAndDelete(req.params.id);
//     const userEmail = bookingdemo.userId.email;
//     console.log(userEmail)
//     if (!deletedBooking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }
//     else{
//       const halfRefundEmail = `<!DOCTYPE html>
//                                                    <html>
//                                                    <head>
//                                                        <meta charset="UTF-8">
//                                                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                                                        <title>Reset Your Password</title>
//                                                    </head>
//                                                    <body>
//                                                        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.5; color: #333;">
//                                                            <h2 style="color: #007bff;">Password Reset Request</h2>
//                                                            <p>You recently requested to reset your password. Click the button below to set a new password.</p>
//                                                            <a href="${url}" style="display: inline-block; padding: 10px 20px; margin: 10px 0; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
//                                                            <p>If you did not request this, please ignore this email. Your password will remain unchanged.</p>
//                                                            <p>Best regards,</p>
//                                                            <p><strong>Take Outdoors Team</strong></p>
//                                                        </div>
//                                                    </body>
//                                                    </html>
//                       `;
//                       //email send...
//       await mailUtil.sendingMail(userEmail,"Cancle Booking Refund",halfRefundEmail)
//     }
//     res.status(200).json({ message: "Booking deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting booking", error: error.message });
//   }
// };
const deleteBooking = async (req, res) => {
  try {
    // First find the booking with populated user data
    const booking = await BookingModel.findById(req.params.id).populate({
      path: 'userId',
      select: 'email' // Only fetch the email field from user
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify the populated user data exists
    if (!booking.userId || !booking.userId.email) {
      return res.status(400).json({ message: "User information not found for this booking" });
    }

    const userEmail = booking.userId.email;
    console.log("User Email:", userEmail); // Should now print correctly

    // Now delete the booking
    const deletedBooking = await BookingModel.findByIdAndDelete(req.params.id);
    
    if (!deletedBooking) {
      // This should theoretically never happen since we already found the booking
      return res.status(500).json({ message: "Deletion failed after finding booking" });
    }

    const refundEmail = `<!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Cancellation Refund</title>
      </head>
      <body>
          <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.5; color: #333;">
              <h2 style="color: #007bff;">Booking Cancellation</h2>
              <p>Your booking has been successfully cancelled.</p>
              <p>A refund has been processed for your booking. Please allow 3-5 business days for the amount to reflect in your account.</p>
              <p>If you have any questions, please contact our support team.</p>
              <p>Best regards,</p>
              <p><strong>Take Outdoors Team</strong></p>
          </div>
      </body>
      </html>`;

    await mailUtil.sendingMail(userEmail, "Booking Cancellation Refund", refundEmail);

    return res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error in deleteBooking:", error);
    return res.status(500).json({ 
      message: "Error deleting booking", 
      error: error.message 
    });
  }
};

// Delete booking by hordingId + full refund mail
const deleteBookingbyhordingId = async(req,res) => {
  try{
    const deletebookingbyhordingId = await BookingModel.findByIdAndDelete(req.params.hordingId);
    if (!deletebookingbyhordingId) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ message: "Booking deleted successfully" });
  }
  catch(err){
    res.status(500).json({
      message: err.message
    })
  }
}

// Delete booking by hordingId
const deleteBookingbyuserId = async(req,res) => {
  try{
    const deletebookingbyuserId = await BookingModel.findByIdAndDelete(req.params.userId);
    if (!deletebookingbyuserId) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ message: "Booking deleted successfully" });
  }
  catch(err){
    res.status(500).json({
      message: err.message
    })
  }
}


//date availability
const checkDateAvailability=async(req,res) => {
  try{
    
  const { hordingId, startDate, endDate } = req.params;
  
  const requestedStart = new Date(startDate);
  const requestedEnd = new Date(endDate)
  const existingbooking=await BookingModel.find({hordingId})
  const requestedDates = getDatesInRange(requestedStart, requestedEnd);
  let bookedDates = []
  existingbooking.forEach(booking => {
    bookedDates = [...bookedDates, ...getDatesInRange(booking.startDate, booking.endDate)];
  });
  const conflictingDates = requestedDates.filter(date => bookedDates.includes(date));
  const availableDates = requestedDates.filter(date => !bookedDates.includes(date));
  res.status(200).json({
    canBookFullRange: conflictingDates.length === 0,
    availableForPartial: availableDates.length > 0,
    conflictingDates,
    availableDates
    
  });}
  catch(error){
    res.status(500).json({ 
      message: "Availability check failed",
      error: error.message 
    });
  }
  
}

module.exports = { addBooking, getAllBookings, getBookingById, getBookingsByUserId, updateBooking, deleteBooking ,checkDateAvailability, deleteBookingbyhordingId, deleteBookingbyuserId};