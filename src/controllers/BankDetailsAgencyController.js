const bankdetailsagencyModel = require("../models/BankDetailsAgencyModel");

//Add Bank Details
const addBankDetails = async(req,res)=>{
    try{
        const creatBankDetails = await bankdetailsagencyModel.create(req.body);
        res.status(200).json({
            message: "Bank details of agency added successfully...",
            data: creatBankDetails
        })
    }
    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}

//Get Bank Details By User Id
const getBankDetailsbyuserId = async(req,res)=>{
    try{
        const showBankDetails = await bankdetailsagencyModel.findOne({ userId: req.params.userId }).populate("userId");
        res.status(200).json({
            message: "Bank details of agency fetched successfully...",
            data: showBankDetails
        }) 
    }
    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}

const getAllBankDetails = async(req, res) => {
    try {
        const allBankDetails = await bankdetailsagencyModel.find().populate("userId");
        res.status(200).json({
            message: "All bank details fetched successfully...",
            data: allBankDetails
        });
    } catch(err) {
        res.status(500).json({
            message: err.message
        });
    }
};

const updateBankDetails = async(req, res) => {
    try {
        const updatedDetails = await bankdetailsagencyModel.findOneAndUpdate(
            { userId: req.params.userId },
            req.body,
            { new: true }
        ).populate("userId");
        
        res.status(200).json({
            message: "Bank details updated successfully...",
            data: updatedDetails
        });
    } catch(err) {
        res.status(500).json({
            message: err.message
        });
    }
};

module.exports = {
    addBankDetails,
    getBankDetailsbyuserId,
    getAllBankDetails,
    updateBankDetails
}