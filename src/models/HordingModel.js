const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hordingSchema = new Schema({

    hoardingDimension:{
        type: String,
        required: true
    },
    hoardingType:{
        enum: ['Unipole', 'Billboard', 'Gantry', 'Digital'],
        type: String,
        required: true
    },
    Availablity_Status:{
        type: Boolean,
        required: true,
        default: true
    },
    hourlyRate:{
        type: Number,
        required: true
    },
    hordingURL:{
        type: String,
        required: true
    },
    stateId:{
        type: Schema.Types.ObjectId,
        ref: 'state',
        required: true
    },
    cityId:{
        type: Schema.Types.ObjectId,
        ref: 'city',
        required: true
    },
    areaId:{
        type: Schema.Types.ObjectId,
        ref: 'area',
        required: true
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    latitude:{
        type: Number,
        required: true
    },
    longitude:{
        type: Number,
        required: true
    },
},{timestamps: true});
module.exports = mongoose.model('hording', hordingSchema);