const BookingModel = require("../models/BookingModel");
const multer = require("multer");
const cloudinaryUtil = require("../utils/cloudnaryUtil");
const { getDatesInRange } = require("../utils/dateUtil");
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
        const cloudinaryResponse = await cloudinaryUtil.uploadFileToCloudinary(
          req.file
        );
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
    res
      .status(200)
      .json({ message: "Bookings fetched successfully", data: bookings });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching bookings", error: error.message });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const booking = await BookingModel.findById(req.params.id).populate(
      "hordingId userId"
    );
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res
      .status(200)
      .json({ message: "Booking found successfully", data: booking });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching booking", error: error.message });
  }
};

// Get bookings by user ID
const getBookingsByUserId = async (req, res) => {
  try {
    const bookings = await BookingModel.find({
      userId: req.params.userId,
    }).populate("hordingId");
    res
      .status(200)
      .json({ message: "Bookings fetched successfully", data: bookings });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user bookings", error: error.message });
  }
};

// Update booking
const updateBooking = async (req, res) => {
  try {
    const updatedBooking = await BookingModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res
      .status(200)
      .json({ message: "Booking updated successfully", data: updatedBooking });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating booking", error: error.message });
  }
};

// Delete booking by id + half refund mail
const deleteBooking = async (req, res) => {
  try {
    // Find the booking with user data
    const booking = await BookingModel.findById(req.params.id)
      .populate("userId", "email") // Only get user's email
      .exec();

    const totalCost = ((booking.totalCost)/2);

    if (!booking) {
      console.log("Booking not found");
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    //Delete the booking
    const result = await BookingModel.deleteOne({ _id: req.params.id });

    if (result.deletedCount === 0) {
      console.log("Deletion failed unexpectedly");
      return res.status(500).json({
        success: false,
        message: "Failed to delete booking",
      });
    }

    //Send cancellation email
    if (booking.userId?.email) {
      const emailContent = `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px; }
                .content { margin: 20px 0; }
                .refund { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .footer { font-size: 0.9em; color: #7f8c8d; border-top: 1px solid #eee; padding-top: 10px; }
                .button { background-color: #3498db; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>Booking Cancellation Confirmation</h2>
            </div>
            
            <div class="content">
                <p>Dear ${booking.userId?.name || "Valued Customer"},</p>
                
                <p>We've processed your cancellation request for booking </p>
                
                <div class="refund">
                    <h3>Refund Details</h3>
                    <p><strong>Refund Amount:</strong> ${totalCost}</p>
                    <p><strong>Expected Processing Time:</strong> 5-7 business days</p>
                    <p>The amount will be credited back to your original payment method.</p>
                </div>
                
            </div>
            
            <div class="footer">
                <p>Thank you for choosing our service.</p>
                <p><strong>The Take Outdoors Team</strong></p>
            </div>
        </body>
        </html>`;

      await mailUtil.sendingMail(
        booking.userId.email,
        "Booking Cancellation Confirmation",
        emailContent
      );
      console.log("Cancellation email sent to:", booking.userId.email);
    }

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
      bookingId: booking._id,
    });
  } catch (error) {
    console.error("Error in deleteBooking:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting booking",
      error: error.message,
    });
  }
};

// Delete booking by hordingId + full refund mail
const deleteBookingbyhordingId = async (req, res) => {
  try {
    const deletebookingbyhordingId = await BookingModel.findByIdAndDelete(
      req.params.hordingId
    );
    if (!deletebookingbyhordingId) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Delete booking by hordingId
const deleteBookingbyuserId = async (req, res) => {
  try {
    const deletebookingbyuserId = await BookingModel.findByIdAndDelete(
      req.params.userId
    );
    if (!deletebookingbyuserId) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

//date availability
const checkDateAvailability = async (req, res) => {
  try {
    const { hordingId, startDate, endDate } = req.params;

    const requestedStart = new Date(startDate);
    const requestedEnd = new Date(endDate);
    const existingbooking = await BookingModel.find({ hordingId });
    const requestedDates = getDatesInRange(requestedStart, requestedEnd);
    let bookedDates = [];
    existingbooking.forEach((booking) => {
      bookedDates = [
        ...bookedDates,
        ...getDatesInRange(booking.startDate, booking.endDate),
      ];
    });
    const conflictingDates = requestedDates.filter((date) =>
      bookedDates.includes(date)
    );
    const availableDates = requestedDates.filter(
      (date) => !bookedDates.includes(date)
    );
    res.status(200).json({
      canBookFullRange: conflictingDates.length === 0,
      availableForPartial: availableDates.length > 0,
      conflictingDates,
      availableDates,
    });
  } catch (error) {
    res.status(500).json({
      message: "Availability check failed",
      error: error.message,
    });
  }
};

module.exports = {
  addBooking,
  getAllBookings,
  getBookingById,
  getBookingsByUserId,
  updateBooking,
  deleteBooking,
  checkDateAvailability,
  deleteBookingbyhordingId,
  deleteBookingbyuserId,
};
