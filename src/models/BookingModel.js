const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  hordingId: {
    type: Schema.Types.ObjectId,
    ref: "hording",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  adName: {
    type: String,
    required: true,
  },
  adDescription: {
    type: String,
    required: true,
  },
  adFile: {
    type: String, // Cloudinary URL
    required: true,
  },
  websiteProductUrl: {
    type: String,
    default: null, // Optional field
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  totalCost: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: Boolean,
    required: true,
    default: false,
  },
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: "payments",
    default: null, // Linked only if payment is successful
  },
}, { timestamps: true });

module.exports = mongoose.model("booking", bookingSchema);
