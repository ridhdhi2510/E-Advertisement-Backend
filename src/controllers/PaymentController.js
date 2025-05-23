
const paymentModel = require("../models/PaymentModel");

//Add Payment
const addPayment = async (req, res) => {
    try {
      const { userId, amount, paymentStatus, transactionId, bookingId } = req.body;
      
      // Validate required fields
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      if (!amount) {
        return res.status(400).json({ message: "Amount is required" });
      }
      if (!paymentStatus) {
        return res.status(400).json({ message: "Payment status is required" });
      }
      if (!transactionId) {
        return res.status(400).json({ message: "Transaction ID is required" });
      }
  
      // Validate amount is a number
      if (isNaN(amount)) {
        return res.status(400).json({ message: "Amount must be a number" });
      }
  
      const savedPayment = await paymentModel.create({
        userId,
        amount,
        paymentStatus,
        transactionId,
        bookingId: bookingId ,
      });
  
      res.status(201).json({
        message: "Payment done successfully",
        data: savedPayment,
      });
    } catch (err) {
      console.error("Payment creation error:", err);
      res.status(500).json({
        message: "Error processing payment",
        error: err.message,
      });
    }
  };

  //Get All Payment
const getAllPayments = async (req, res) => {
  try {
    const showPayments = await paymentModel.find().populate("bookingId userId");
    if (showPayments.length === 0) {
      res.status(404).json({
        message: "No payments found",
      });
    } else {
      res.status(200).json({
        message: "Successfully fetched all payments",
        data: showPayments,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

//Get APyment By Id
const getPaymentById = async (req, res) => {
  try {
    const showPaymentsbyId = await paymentModel
      .findById(req.params.id)
      .populate("bookingId userId");
    if (showPaymentsbyId.length === 0) {
      res.status(404).json({
        message: "No payments found",
      });
    } else {
      res.status(200).json({
        message: "Successfully fetched all payments by Id",
        data: showPaymentsbyId,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

//Get Payments By UserId
const getAllPaymentsByUserId = async (req, res) => {
  try {
    const showPaymentsbyUserId = await paymentModel
      .find({ userId: req.params.userId })
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'hordingId', populate: ['areaId', 'cityId', 'stateId'] },
          { path: 'userId' }
        ]
      })
      .sort({ paymentDate: -1 }); // Sort by most recent first

    if (showPaymentsbyUserId.length === 0) {
      res.status(404).json({
        message: "No payments found",
        data: []
      });
    } else {
      res.status(200).json({
        message: "Successfully fetched all payments by user Id",
        data: showPaymentsbyUserId,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

//update booking id from null to number
const updatePayment = async (req, res) => {
  try {
    const {bookingId} = req.body
    
    const updatepay = await paymentModel.findByIdAndUpdate(
      req.params.id,
      {bookingId: bookingId}
    );
    res.status(201).json({
        message: "booking id updated",
        data: updatepay
    })
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
 const  updatePaymentRefund=async(paymentId,refundamount)=>{
  try{
    const updateRefund=await paymentModel.findByIdAndUpdate( paymentId,
      {
        $set: {
          paymentStatus: "Refunded",
          refundStatus: "Completed",
          amount:refundamount
        }
      },
      { new: true })
    return {
      success: true,
      data:updateRefund,
      message: "payment status changed",
    };
  }
  catch (error) {
    console.error("Error in update paymentstatus", error);
    return {
      success: false,
      message: "Failed to update payment status",
      error: error.message,
    };
  }
 }

module.exports = {
  addPayment,
  getAllPayments,
  getPaymentById,
  getAllPaymentsByUserId,
  updatePayment,
  updatePaymentRefund
};
