const mongoose = require('mongoose');
const { Schema } = mongoose;

const employerDocumentSchema = new mongoose.Schema ({

    name: {
        type: String,
        required: false
    },
    
    address: {
        type: String,
        required: false
    },

    code: {
        type: String,
        required: false
    },

    phoneNumber: {
        type: String,
        required: false
    },

    email: {
        type: String,
        required: false
    },

    supervisorName: {
        type: String,
        required: false
    },

    supervisorPhoneNumber: {
        type: String,
        required: false
    },

    supervisorEmail: {
        type: String,
        required: false
    },

    status: {
        type: String,
        required: false
    },

    signaturePath: {
        type: String,
        required: false
    },

    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'document',
        required: true
    },

    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }

});


module.exports = mongoose.model(
    'employerDocument',
    employerDocumentSchema
);