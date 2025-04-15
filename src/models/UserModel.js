const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSchema = new Schema({

    name: {
        type: String,
        required: true,
        maxlength: 255
    },
    email: {
        type: String,
        required: true,
        unique: true,
        maxlength: 255
    },
    // phone: {
    //     type: String,
    //     maxlength: 20
    // },
    password: {
        type: String,
        required: true,
        // maxlength: 255
    },
    // role: {
    //     type: String,
    //     enum: ['customer', 'agency'],
    //     required: true
    // },
    roleId:{
        type:Schema.Types.ObjectId,
        ref:"roles"
    },
    // roleName:{
    //     type: String
    // },
    created_at: {
        type: Date,
        default: Date.now
    },

    phone: {
        type: String,
        maxlength: 20
    },
    // bankDetails: {
    //     bankName: String,
    //     accountNumber: String,
    //     accountHolderName: String,
    //     iban: String
    // },
})

module.exports = mongoose.model("users",userSchema)