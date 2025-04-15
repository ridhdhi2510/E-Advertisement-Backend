const bankdetailsagencyModel = require("../models/BankDetailsAgencyModel");

//add
//getall
//getbyid
//getbyuserId

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

module.exports = {
    addBankDetails,
    getBankDetailsbyuserId
}