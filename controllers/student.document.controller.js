const StudentDocument = require ('../models/student.document');
const Document = require('../models/document');

const getStudentDocument = (req, res, next) => {

    StudentDocument.findById(req.params.id)
    .then(result => {
        if (result) {
            Document.findOne({_id: result.documentId})
            .then(foundDocument => {
                res.status(200).json({
                    ...result._doc,
                    documentName: foundDocument.name
                });
            })
            .catch(error => {
                console.log(error);
                res.status(500).json({
                    message: "Fetching document failed!"
                });
            });
        } else {
            res.status(404).json({ message: "Student document not found!"});
        }
    })
    .catch(error => {
        res.status(500).json({
            message: "Fetching student document failed!"
        });
    });
};

const getStudentDocuments = (req, res, next) => {
    StudentDocument.find({creator: req.userData.userId})
    .then(result => {
        if (result) {
            Document.findOne({_id: result[0].documentId})
            .then(foundDocument => {
                res.status(200).json({
                    message: "Studentdocuments fetched succesfully!",
                    studentDocuments: result,
                    maxStudentDocuments: 1,
                    documentName: foundDocument.name
                });
            })
            .catch(error => {
                console.log(error);
                res.status(500).json({
                    message: "Fetching document failed!"
                });
            });
        } else {
            res.status(404).json({ message: "Student document not found!"});
        }
    })
    .catch(error => {
        res.status(500).json({
            message: "Fetching student document failed!"
        });
    });
};

const updateStudentDocument = (req, res, next) => {
    const newValues = {$set: {
        lastName: req.body.lastName,
        initials: req.body.initials,
        firstName: req.body.firstName,
        dob: req.body.dob,
        sex: req.body.sex,
        phoneNumber: req.body.phoneNumber,
        email: req.body.email,
        address: req.body.address,
        zipCode: req.body.zipCode,
        city: req.body.city,
        status: 'Ingevuld',
    }};
    
    StudentDocument.updateOne({ _id: req.params.id, creator: req.userData.userId}, newValues)
        .then(result => {
            res.status(201).json({
                message: "Student document added successfully!",
                studentDocument: {
                    ...result,
                    id: result._id
                }
            });
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                message: "Creating a student document failed!"
            });
        });
};

module.exports = {
    getStudentDocument,
    getStudentDocuments,
    updateStudentDocument,
}