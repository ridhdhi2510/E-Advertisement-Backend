// controllers/ActivityController.js
const ActivityModel = require('../models/ActivityModel');

// Get recent activities
const getRecentActivities = async (req, res) => {
  try {
    const activities = await ActivityModel.find()
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.status(200).json({
      message: "Recent activities fetched successfully",
      data: activities
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching activities", error: error.message });
  }
};

// Helper function to create activities (used by other controllers)
const createActivity = async (type, userId, userName, targetId, description, metadata = {}) => {
  try {
    await ActivityModel.create({
      type,
      userId,
      userName,
      targetId,
      description,
      metadata
    });
  } catch (error) {
    console.error("Error creating activity:", error);
  }
};

module.exports = { getRecentActivities, createActivity };