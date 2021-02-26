const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: true
    },

    student: {
        type: String,
        required: true
    },

    educationalInstitution: {
        type: String,
        required: true
    },
    
    employer: {
        type: String,
        required: true
    },

    educationalName: {
        type: String,
        required: false
    },

    educationalForm: {
        type: String,
        required: false
    },

    educationalAttainment: {
        type: String,
        required: false
    },

    CROHONumber: {
        type: String,
        required: false
    },

    startDate: {
        type: String,
        required: false
    },

    endDate: {
        type: String,
        required: false
    },

    clockHours: {
        type: String,
        required: false
    },

    status: {
        type: String,
        required: false
    },

    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },

    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'studentDocument',
        required: false
    },

    educationalInstitutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'educationalInstitutionDocument',
        required: false
    },

    employerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employerDocument',
        required: false
    }

});

module.exports = mongoose.model(
    'Document',
    documentSchema
);