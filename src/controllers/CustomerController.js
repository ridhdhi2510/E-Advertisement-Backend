const userModel = require("../models/UserModel");
const roleModel = require("../models/RoleModel");
const bookingModel = require("../models/BookingModel");

const getAllCustomers = async (req, res) => {
  try {
    const customerRole = await roleModel.findOne({ name: "customer" });
    if (!customerRole) {
      return res.status(404).json({ message: "Customer role not found" });
    }

    const customers = await userModel.find({ roleId: customerRole._id });

    const customerWithBookings = await Promise.all(
      customers.map(async (customer) => {
        const bookings = await bookingModel.find({ userId: customer._id }).populate("hordingId");

        return {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone || null,
          status: customer.status || "active", // use "active" or customize logic
          bookings: bookings.map(b => ({
            id: b._id,
            adName: b.adName,
            startDate: b.startDate,
            endDate: b.endDate,
            totalCost: b.totalCost,
            status: b.status,
            hoardingLocation: b.hordingId?.location || null, // customize this based on schema
          }))
        };
      })
    );

    res.status(200).json({
      message: "Customers fetched successfully",
      data: customerWithBookings
    });

  } catch (err) {
    console.error("Error fetching customers:", err);
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
    getAllCustomers
};


