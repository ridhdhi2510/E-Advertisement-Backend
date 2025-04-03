const BookingModel = require("../models/BookingModel");
const multer = require("multer");
const cloudinaryUtil = require("../utils/cloudnaryUtil");

// Multer storage configuration
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
 },
});
const upload = multer({ storage: storage }).single("adFile");

// Add booking
const addBooking = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    try {
      const { adName, adDescription, startDate, endDate, totalCost, websiteProductUrl } = req.body;
      const userId = req.headers["userid"];
      const hordingId = req.headers["hordingid"];
      
      if (!userId || !hordingId) {
        return res.status(400).json({ message: "User ID and Hoarding ID are required!" });
      }
      
      let adFileUrl = null;
      if (req.file) {
        const cloudinaryResponse = await cloudinaryUtil.uploadFileToCloudinary(req.file);
        adFileUrl = cloudinaryResponse.secure_url;
      }
      
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
      
      res.status(201).json({ message: "Booking created successfully", data: newBooking });
    } catch (error) {
      res.status(500).json({ message: "Error adding booking", error: error.message });
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

// Delete booking
const deleteBooking = async (req, res) => {
  try {
    const deletedBooking = await BookingModel.findByIdAndDelete(req.params.id);
    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting booking", error: error.message });
  }
};

module.exports = { addBooking, getAllBookings, getBookingById, getBookingsByUserId, updateBooking, deleteBooking };