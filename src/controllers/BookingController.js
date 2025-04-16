const BookingModel = require("../models/BookingModel");
const multer = require("multer");
const { updatePaymentRefund } = require("../controllers/PaymentController");
const cloudinaryUtil = require("../utils/CloudnaryUtil.js");
const { getDatesInRange } = require("../utils/dateUtil");
const mailUtil = require("../utils/MailUtil.js");
const mongoose = require('mongoose');
const { createActivity } = require('./ActivityController');

// Multer storage configuration
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage }).single("adFile");

//Add Booking
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
        hordingId,
        paymentId 
      } = req.body;

      // Validate required fields
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

      // Upload to Cloudinary if file is present
      let adFileUrl = null;
      if (req.file) {
        const cloudinaryResponse = await cloudinaryUtil.uploadFileToCloudinary(
          req.file
        );
        console.log("Cloudinary Upload Response:", cloudinaryResponse);
        adFileUrl = cloudinaryResponse.secure_url;
      }

      // Create booking in DB
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
        paymentId
      });

      
      //Show new booking created at recent activity log
      try {
        const user = await mongoose.model("users").findById(userId).select("name");
        await createActivity(
          'booking_created',
          userId,
          user.name,
          newBooking._id,
          `New booking created by ${user.name}`
        );
        
      } catch (error) {
        console.error('Error while creating activity for booking creation:', error);
      }
      

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

    //Show upddate booking at recent activity log
    try {
      const user = await mongoose.model("users").findById(updatedBooking.userId).select("name");
      await createActivity(
        'booking_updated',
        updatedBooking.userId,
        user.name,
        updatedBooking._id,
        `Booking updated by ${user.name}`
      );
    } catch (activityErr) {
      console.error("Failed to log booking update activity:", activityErr);
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
      .populate("userId", "email name _id") // Only get user's email
      .exec();

      const refundamount=((booking.totalCost)/2)
      const paymentstatusResult = await updatePaymentRefund(booking.paymentId,refundamount);
      console.log('Booking cancellation result:', paymentstatusResult);
    
    const totalCost = ((booking.totalCost) / 2);

    if (!booking) {
      console.log("Booking not found");
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    

    try {
      await createActivity(
        'booking_cancelled',
        booking.userId._id,
        booking.userId.name,
        booking._id,
        `Booking cancelled by ${booking.userId.name}`
      );
    } catch (error) {
      console.error('Error while creating activity for booking cancellation:', error);
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
const deleteBookingsbyhordingId = async (hoardingId) => {
  try {
    console.log("hoarding id in booking controller", hoardingId);
    if (!hoardingId || !mongoose.Types.ObjectId.isValid(hoardingId)) {
      throw new Error("Invalid hoarding ID format");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookings = await BookingModel.find({
      hordingId: new mongoose.Types.ObjectId(hoardingId),
      startDate: { $gte: today },
    }).populate("userId", "email name").lean();

    if (!bookings || bookings.length === 0) {
      return {
        success: true,
        cancelled: 0,
        message: "No active bookings found for this hoarding",
      };
    }

    const cancellationResults = await Promise.all(
      bookings.map(async (booking) => {
        try {
          if (!booking?.userId?.email || !booking?.paymentId) {
            throw new Error("Incomplete booking data");
          }

          const refundAmount = booking.paymentId.amount
            ? booking.paymentId.amount.toFixed(2)
            : 0;

          const emailContent = createCancellationEmail(
            booking,
            refundAmount,
            true
          );

          await mailUtil.sendingMail(
            booking.userId.email,
            "Booking Cancelled: Hoarding Removed",
            emailContent
          );

          const paymentstatusResult = await updatePaymentRefund(booking.paymentId,booking.totalCost);
          console.log('Booking cancellation result:', paymentstatusResult);

          await createActivity(
            'booking_cancelled',
            booking.userId._id,
            booking.userId.name,
            booking._id,
            `Booking cancelled due to hoarding removal by ${booking.userId.name}`
          );

          await BookingModel.deleteOne({ _id: booking._id });

          return {
            success: true,
            bookingId: booking._id,
            refundAmount,
          };
        } catch (error) {
          console.error(`Failed to cancel booking ${booking?._id}:`, error);
          return {
            success: false,
            bookingId: booking?._id,
            error: error.message,
          };
        }
      })
    );

    const successful = cancellationResults.filter(r => r.success).length;

    return {
      success: true,
      cancelled: successful,
      total: bookings.length,
      results: cancellationResults,
    };

  } catch (error) {
    console.error("Error in deleteBookingsbyhordingId:", error);
    return {
      success: false,
      message: "Failed to cancel bookings",
      error: error.message,
    };
  }
};


// Helper function (same as before)
const createCancellationEmail = (booking, refundAmount, isHoardingDeleted = false) => {
  const reason = "the advertising hoarding has been removed from our platform";

  return `<!DOCTYPE html>
          <html>
          <head>
              <meta charset="UTF-8">
              <style>
                  body { 
                      font-family: Arial, sans-serif; 
                      line-height: 1.6; 
                      color: #333; 
                      max-width: 600px; 
                      margin: 0 auto; 
                      padding: 20px; 
                  }
                  .header { 
                      color: #2c3e50; 
                      border-bottom: 1px solid #eee; 
                      padding-bottom: 10px; 
                  }
                  .content { 
                      margin: 20px 0; 
                  }
                  .refund { 
                      background: #f8f9fa; 
                      padding: 15px; 
                      border-radius: 5px; 
                      margin: 20px 0; 
                  }
                  .footer { 
                      font-size: 0.9em; 
                      color: #7f8c8d; 
                      border-top: 1px solid #eee; 
                      padding-top: 10px; 
                  }
                  .booking-id {
                      font-weight: bold;
                      color: #2c3e50;
                  }
              </style>
          </head>
          <body>
              <div class="header">
                  <h2>Booking Cancellation Notification</h2>
              </div>
              
              <div class="content">
                  <p>Dear ${booking.userId?.name || "Customer"},</p>
                  
                  <p>We regret to inform you that your booking <span class="booking-id">#${booking._id.toString().slice(-6)}</span> has been cancelled because ${reason}.</p>
                  
                  <div class="refund">
                      <h3>Refund Details</h3>
                      <p><strong>Refund Amount:</strong> ₹${booking.totalCost.toFixed(2)}</p>
                      <p><strong>Processing Time:</strong> 5-7 business days</p>
                      <p>The amount will be credited back to your original payment method.</p>
                  </div>
                  
                  <p>We apologize for any inconvenience this may cause.</p>
              </div>
              
              <div class="footer">
                  <p>If you have any questions, please contact our support team.</p>
                  <p><strong>The Take Outdoors Team</strong></p>
              </div>
          </body>
          </html>`;
};

// Delete booking by userId
const deleteBookingbyuserId = async (req, res) => {
  try {
    // Step 1: Find the booking and populate user info
    const booking = await BookingModel.findById(req.params.userId)
      .populate("userId", "name email")
      .exec();

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Step 2: Log activity before deletion
    try {
      await createActivity(
        "booking_deleted",
        booking.userId._id,
        booking.userId.name,
        booking._id,
        `Booking deleted by ${booking.userId.name}`
      );
    } catch (activityErr) {
      console.error("Error logging activity:", activityErr);
    }

    // Step 3: Delete the booking
    await BookingModel.deleteOne({ _id: req.params.userId });

    return res.status(200).json({
      message: "Booking deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting booking:", err);
    return res.status(500).json({
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
  deleteBookingsbyhordingId,
  deleteBookingbyuserId,
};
