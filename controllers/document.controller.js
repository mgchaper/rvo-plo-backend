const Document = require('../models/document');
const StudentDocument = require('../models/student.document');
const EducationalInstitutionDocument = require('../models/educationalInstitution.document');
const EmployerDocument = require('../models/employer.document');
const Signature = require('../models/signature');
const pdf = require('./pdf.controller');
const mail = require ('./mail.controller');
const user = require('../models/user');
const { Student } = require('../middleware/role');

const getDocument = (req, res, next) => {
    Document.findById(req.params.id)
    .then(result => {
        if (result) {
            res.status(200).json(result);
        } else {
            res.stauts(404).json({ message: 'Document not found!'});
        }
    })
    .catch(error => {
        res.status(500).json({
            message: 'Fetching document failed!'
        });
    });
};

const createDocument = (req, res, next) => {
    const document = new Document({
        name: req.body.name,
        student: req.body.student,
        educationalInstitution: req.body.educationalInstitution,
        employer: req.body.employer,
        educationalName: req.body.educationalName,
        educationalForm: req.body.educationalForm,
        educationalAttainment: req.body.educationalAttainment,
        CROHONumber: req.body.CROHONumber,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        clockHours: req.body.clockHours,
        creator: req.userData.userId,
        status: 'Aangemaakt'
    });
    document
    .save()
    .then(createdDocument => {
        mail.createDocumentAccounts(createdDocument);
        res.status(201).json({
            message: 'Document added succesfully',
            document: {
                ...createdDocument,
                id: createdDocument._id
            }
        });
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            message: 'Creating a document failed!'
        });
    });
};

const updateDocument = (req, res, next) => {

    //e-mailadressen van een document kunnen niet geupdate worden.
    const newValues = {$set: {
        name: req.body.name,
        CROHONumber: req.body.CROHONumber,
        clockHours: req.body.clockHours,
        educationalAttainment: req.body.educationalAttainment,
        educationalform: req.body.educationalform,
        educationalName: req.body.educationalName,
        endDate: req.body.endDate,
        startDate: req.body.startDate,
    }};

    Document.updateOne({
        _id: req.params.id,
        creator: req.userData.userId
    }, newValues)
    .then(result => {
        res.status(201).json({
            message: 'Document updated succesfully!',
            document: {
                ...result,
                id: result._id
            }
        });
    })
    .catch(error => {
        res.status(500).json({
            message: 'Couldnt\'t update document!' 
        });
    });
};

const getDocuments = (req, res, next) => {
    const documentPageSize = +req.query.pagesize;
    const currentDocumentPage = +req.query.page;
    const documentQuery = Document.find()

    let fetchedDocuments;

    if(documentPageSize && currentDocumentPage) {
        documentQuery.skip(documentPageSize * (currentDocumentPage -1)).limit(documentPageSize);
    };

    documentQuery
    .then(documents => {
        fetchedDocuments = documents;
        return Document.count();
    })
    .then(count => {
        res.status(200).json({
            message: "Documents fetched successfully!",
            documents: fetchedDocuments,
            maxDocuments: count
        });
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            message: 'Fetching documents failed!'
        });
    });
};

const deleteDocument = (req, res, next) => {
    const documentId = req.params.id;
    Document.findOne({_id: documentId})
    .then(foundDocument => {
        Document.remove({ _id: documentId})
        .then(removedDocument => {
            StudentDocument.remove({creator: foundDocument.studentId})
            .then(removedStudentDocument => {
                EmployerDocument.remove({creator: foundDocument.employerId})
                .then(removedEmployerDocument => {
                    EducationalInstitutionDocument.remove({creator: foundDocument.educationalInstitutionId})
                    .then(removedEducationalInstitutionDocument => {
                        user.remove({email: foundDocument.student})
                        .then(removedStudent => {
                            user.remove({email: foundDocument.employer})
                            .then(removedEmployer => {
                                user.remove({email: foundDocument.educationalInstitution})
                                .then(removedEducationalInstitution => {
                                    res.status(200).json({
                                        message:'Document deletion succesful!'
                                    });
                                })
                                .catch(error => {
                                    res.status(500).json({
                                        message: 'Could not delete educational institution user!'
                                    });
                                });
                            })
                            .catch(error=> {
                                res.status(500).json({
                                    message: 'Could not delete employer user!'
                                });
                            });

                        })
                        .catch(error => {
                            res.status(500).json({
                                message: 'Could not delete student user!'
                            });
                        });

                    })
                    .catch(error =>{
                        res.status(500).json({
                            message: 'Could not delete educational institution document!'
                        })
                    })
                })
                .catch(error => {
                    res.status(500).json({
                        message: 'Could not delete employer document!'
                    });
                });
            })
            .catch(error => {
                res.status(500).json({
                    message: 'Could not delete student document!'
                });
            });
        })
        .catch(error => {
            res.status(500).json({
                message: 'Deleting document failed!'
            });
        });        
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            message: "Could not find document!"
        });
    });
};

const generateDocument = (req, res, next) => {
    Document.findOne({_id: req.params.id})
    .then(foundDocument => {
        StudentDocument.findOne({documentId: foundDocument._id})
        .then (foundStudentDocument => {
            EducationalInstitutionDocument.findOne({documentId: foundDocument._id})
            .then(foundEducationalInstitutionDocument => {
                EmployerDocument.findOne({documentId: foundDocument._id})
                .then(foundEmployerDocument => {
                    pdf.generatePdf(
                        foundDocument, 
                        foundStudentDocument,
                        foundEducationalInstitutionDocument,
                        foundEmployerDocument);
                })
                .catch(error => {
                    console.log(error);
                    res.status(500).json({
                        message: 'Could not find employer document'
                    });
                });

            })
            .catch(error => {
                res.status(500).json({
                    message: 'Could not find educational institution document!'
                });
            });
        })
        .catch(error => {
            res.status(500).json({
                message: 'Could not find student document!'
            });
        });

    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            message: 'Could not find main document!'
        });
    });
}

const getStatus = (req, res, next) => {
    let studentCheck = false;
    let educationalInstitutionCheck = false;
    let employerCheck = false;

    StudentDocument.findOne({documentId: req.params.id})
    .then(studentDocument => {
        if(studentDocument.status === 'Ingevuld') {
            studentCheck = true;
        };
        EducationalInstitutionDocument.findOne({documentId: req.params.id})
        .then(educationalInstitutionDocument => {
            if(educationalInstitutionDocument.status === 'Ingevuld') {
                educationalInstitutionCheck = true;
            };
            EmployerDocument.findOne({documentId: req.params.id})
            .then(employerDocument => {
                if(employerDocument.status === 'Ingevuld') {
                    employerCheck = true;
                };
                res.status(200).json({
                    student: studentCheck,
                    educationalInstitution: educationalInstitutionCheck,
                    employer: employerCheck
                });
            })
            .catch(error => {
                res.status(500).json({
                    message: 'Could not find employer document!'
                });
            });
        })
        .catch(error => {
            res.status(500).json({
                message: 'Could not find educational institution document!'
            });
        });
    })
    .catch(error => {
        res.status(500).json({
            message: 'Could not find student document!'
        });
    });
};

module.exports = {
    getDocument,
    getDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    generateDocument,
    getStatus,
}