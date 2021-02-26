const mongoose = require('mongoose');
const { Schema } = mongoose;

//TODO: Van documentID nog een ObjectID reference maken naar aangemaakte documentId
//Zodra een invite wordt gestuurd voor het deelnemen aan een overeenkomst,
//dient ook een document object en dus documentId aangemaakt te worden.

const studentDocumentSchema = new mongoose.Schema ({ 

    lastName: {
        type: String,
        required: false
    },

    initials: {
        type: String,
        required: false
    },
    
    firstName: {
        type: String,
        required: false
    },

    dob: {
        type: String,
        required: false
    },

    sex: {
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

    address: {
        type: String,
        required: false
    },

    zipCode: {
        type: String,
        required: false
    },

    city: {
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
        ref: "document",
        required: true
    },

    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    }
});

module.exports = mongoose.model(
    'studentDocument',
    studentDocumentSchema
);