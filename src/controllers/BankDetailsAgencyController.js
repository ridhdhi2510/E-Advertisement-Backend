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

module.exports = {
    addBankDetails
}