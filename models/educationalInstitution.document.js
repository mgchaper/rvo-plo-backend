const mongoose = require('mongoose');

const educationalInstitutionDocumentSchema = new mongoose.Schema ({

    name: {
        type: String,
        required: false
    },
    location: {
        type: String,
        required: false
    },
    academy: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false,
    },
    contactName: {
        type: String,
        required: false
    },
    contactPhoneNumber: {
        type: String,
        required: false
    },
    contactEmail: {
        type: String,
        required: false
    },
    mentorName: {
        type: String,
        required: false
    },
    mentorPhoneNumber: {
        type: String,
        required: false
    },
    mentorEmail: {
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
    'educationalInstitutionDocument',
    educationalInstitutionDocumentSchema
);