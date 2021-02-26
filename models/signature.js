const mongoose = require('mongoose');

const signatureSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: true,
    },

    function: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true,
    },

    date: {
        type: String,
        required: true,
    },

    imagePath: {
        type: String, 
        required: true
    },

    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
});

module.exports = mongoose.model(
    'signature',
    signatureSchema
);