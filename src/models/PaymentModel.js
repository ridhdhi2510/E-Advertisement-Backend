const mongoose = require("mongoose")
const Schema = mongoose.Schema

const paymentSchema = new Schema({
    amount:{
        type: Number,
        required: true
    },
    transactionId:{
        type: String,
        unique: true,
        required: true
    },
    paymentStatus:{
        enum: ["Pending", "Completed", "Failed", "Refunded"],
        type: String,
        required: true,
        default: "Pending"
    },
    paymentDate:{
        type: Date,
        required: true,
        default: Date.now
    },
    receiptURL:{
        type: String
        //Optional Field
    },
    refundStatus:{
        enum: ["Not Requested", "Processing", "Completed"],
        type: String,
        default: "Not Requested"
        //Optional Field
    },
    bookingId:{
        type: Schema.Types.ObjectId,
        ref: "booking",
        required: true
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    // currency:{ 
    //     type: String, 
    //     default: "INR" 
    //     //Optional Field
    // },
    // paymentMethod:{ 
    //     enum: ["Credit Card", "Debit Card", "UPI", "Bank Transfer"], 
    //     type: String, 
    //     required: true 
    //     //Optional Field
    // },
},{timestamps : true})

module.exports = mongoose.model("payment",paymentSchema)