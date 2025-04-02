const paymentModel = require("../models/PaymentModel")

//add post
//getall
//get by id
//get by user id

const addPayment = async(req,res) => {
    try{
        const savedPayment = await paymentModel.create(req.body)
        res.status(201).json({
            message: "Payment done successfully",
            data: savedPayment
        })
    }
    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}

const getAllPayments = async(req,res) => {
    try{
        const showPayments = await paymentModel.find().populate("bookingId userId")
        if(showPayments.length === 0){
            res.status(404).json({
                message: "No payments found"
            })
        }
        else{
            res.status(200).json({
                message: "Successfully fetched all payments",
                data: showPayments
            })
        }
    }
    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}

const getAllPaymentsById = async(req,res) => {
    try{
        const showPaymentsbyId = await paymentModel.findById(req.params.id).populate("bookingId userId")
        if(showPaymentsbyId.length === 0){
            res.status(404).json({
                message: "No payments found"
            })
        }
        else{
            res.status(200).json({
                message: "Successfully fetched all payments by Id",
                data: showPaymentsbyId
            })
        }
    }
    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}

const getAllPaymentsByUserId = async(req,res) => {
    try{
        const showPaymentsbyUserId = await paymentModel.find({userId: req.params.userId}).populate("bookingId userId")
        if(showPaymentsbyUserId.length === 0){
            res.status(404).json({
                message: "No payments found"
            })
        }
        else{
            res.status(200).json({
                message: "Successfully fetched all payments by Id",
                data: showPaymentsbyUserId
            })
        }
    }
    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}

module.exports = {
    addPayment,
    getAllPayments,
    getAllPaymentsById,
    getAllPaymentsByUserId
}