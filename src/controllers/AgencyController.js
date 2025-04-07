const userModel = require("../models/UserModel");
const hordingModel = require("../models/HordingModel");
const roleModel = require("../models/RoleModel");

// Get all agencies with their hoarding counts
const getAllAgencies = async (req, res) => {
  try {
    // Find the 'agency' role first
    const agencyRole = await roleModel.findOne({ name: 'agency' });
    if (!agencyRole) {
      return res.status(404).json({ message: "Agency role not found" });
    }

    // Get all users with roleId matching agency role
    const agencies = await userModel.find({ roleId: agencyRole._id });

    // Get counts for each agency
    const agenciesWithCounts = await Promise.all(
      agencies.map(async (agency) => {
        const totalHoardings = await hordingModel.countDocuments({ userId: agency._id });
        const activeHoardings = await hordingModel.countDocuments({ 
          userId: agency._id,
          Availablity_Status: true 
        });

        return {
          id: agency._id,
          name: agency.name,
          email: agency.email,
          phone: agency.phone || null,
          totalHoardings,
          activeHoardings,
          bankDetails: agency.bankDetails || null
        };
      })
    );

    res.status(200).json({
      message: "Agencies fetched successfully",
      data: agenciesWithCounts
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get agency bank details
const getAgencyBankDetails = async (req, res) => {
  try {
    const agencyRole = await roleModel.findOne({ name: 'agency' });
    if (!agencyRole) {
      return res.status(404).json({ message: "Agency role not found" });
    }

    const agencies = await userModel.find({ 
      roleId: agencyRole._id,
      bankDetails: { $exists: true, $ne: null }
    }).select('_id name bankDetails');

    const formattedAgencies = agencies.map(agency => ({
      id: agency._id,
      name: agency.name,
      bankName: agency.bankDetails?.bankName || 'N/A',
      accountNumber: agency.bankDetails?.accountNumber || 'N/A',
      accountHolderName: agency.bankDetails?.accountHolderName || 'N/A',
      iban: agency.bankDetails?.iban || 'N/A'
    }));

    res.status(200).json({
      message: "Agency bank details fetched successfully",
      data: formattedAgencies
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update agency bank details
const updateAgencyBankDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { bankName, accountNumber, accountHolderName, iban } = req.body;

    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { 
        bankDetails: {
          bankName,
          accountNumber,
          accountHolderName,
          iban
        }
      },
      { new: true }
    );

    res.status(200).json({
      message: "Bank details updated successfully",
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        bankName: updatedUser.bankDetails.bankName,
        accountNumber: updatedUser.bankDetails.accountNumber,
        accountHolderName: updatedUser.bankDetails.accountHolderName,
        iban: updatedUser.bankDetails.iban
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllAgencies,
  getAgencyBankDetails,
  updateAgencyBankDetails
};