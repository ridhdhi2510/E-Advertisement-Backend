// models/ActivityModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activitySchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['signup',
          'hording_added',
          'hording_updated',
          'hording_deleted',
          'booking_created',
          'booking_updated',
          'booking_cancelled',
          'booking_deleted']
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  targetId: {
    type: Schema.Types.ObjectId // Could be hordingId, bookingId, etc.
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: Object // Additional data if needed
  }
}, { timestamps: true });

module.exports = mongoose.model('activity', activitySchema);