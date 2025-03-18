const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const advertisementSchema = new Schema({
        name:{
            type: String,
            required: true
        },
        description:{
            type: String,
            required: true
        },
        hoardingType:{
            enum: ['Unipole', 'Billboard', 'Gantry', 'Digital'],
            type: String,
            required: true
        },
        fileURL:{
            type: String,
            required: true    
        },
        websiteURL:{
            type: String
        },
        stateId:{
            type: Schema.Types.ObjectId,
            ref: 'State',
            required: true
        },
        cityId:{
            type: Schema.Types.ObjectId,
            ref: 'City',
            required: true
        },
        areaId:{
            type: Schema.Types.ObjectId,
            ref: 'Area',
            required: true
        },
        // duration:{
        //     type: Number,
        //     required: true
        // },
        start_date:{
            type: Date,  // Stores only the date (without time)
            required: true
        },
        end_date:{
            type: Date,  // Stores only the date (without time)
            required: true
        },
        // time:{
        //     type: String, // Stores time as a string (e.g., "14:30:00")
        //     required: true
        // },
        userId:{
            type: Schema.Types.ObjectId,
            ref: 'users',
            required: true
        }
},{
    timestamps: true
})

module.exports = mongoose.model("Advertisement",advertisementSchema)
