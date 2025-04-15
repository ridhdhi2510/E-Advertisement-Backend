const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const bankDetailsAgencySchema = new Schema({

    bankName:{
        type: String,
        required: true,
    },
    accountNumber: {
        type: Number,
        required: true,
        minlength: 9,
        maxlength: 18
    },
    branchName: {
        type: String,
        required: true
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref:"users"
    }    

},{
    timestamps: true
})
    
module.exports = mongoose.model("bankdetailsagency",bankDetailsAgencySchema)
