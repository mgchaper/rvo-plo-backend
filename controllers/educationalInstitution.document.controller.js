const Document = require('../models/document');
const EducationalInstitutionDocument = require('../models/educationalInstitution.document');

const getEducationalInstitutionDocument = (req, res, next) => {
    EducationalInstitutionDocument.findById(req.params.id)
    .then(result => {
        if(result) {
            Document.findOne({_id: result.documentId})
            .then(foundDocument => {
                res.status(200).json({
                    ...result._doc,
                    documentName: foundDocument.name
                });
            })
            .catch(error => {
                res.status(500).json({
                    message: 'Fetching document failed!'
                });
            });
        } else {
            res.status(400).json({
                message: 'Educational institution document not found!'
            });
        }
    })
    .catch(error => {
        res.status(500).json({
            message: 'Fetching educational institution document failed!'
        });
    });
};

const getEducationalInstitutionDocuments = (req, res, next) => {
    const educationalInstitutionPageSize = +req.query.pageSize;
    const currentEducationalInstitutionPage =  +req.query.page;
    const educationalInstitutionQuery = EducationalInstitutionDocument.find({creator: req.userData.userId});
    let fetchedEducationalInstitutionDocuments;
    let fetchedDocumentsIncludingName = [];

    if(educationalInstitutionPageSize && currentEducationalInstitutionPage) {
        educationalInstitutionQuery.skip(educationalInstitutionPageSize * (currentEducationalInstitutionPage - 1)).limit(educationalInstitutionPageSize);
    }
    educationalInstitutionQuery
    .then(educationalInstitutionDocuments => {
        fetchedEducationalInstitutionDocuments = educationalInstitutionDocuments;
        return EducationalInstitutionDocument.find({creator: req.userData.userId}).count();
    })
    .then(count => {
        for(i = 0; i < fetchedEducationalInstitutionDocuments.length; i++) {
            let educationalInstitutionDocument = fetchedEducationalInstitutionDocuments[i];
            Document.findOne({_id: fetchedEducationalInstitutionDocuments[i].documentId})
            .then(foundDocument => {
                let document = {
                    documentName: foundDocument.name,
                    ...educationalInstitutionDocument._doc
                }
                fetchedDocumentsIncludingName.push(document);
                res.status(200).json({
                    message: 'Educational institution documents fetched successfully!',
                    educationalInstitutionDocuments: fetchedDocumentsIncludingName,
                    maxEducationalInstitutionDocuments: count
                });
            })
            .catch(error => {
                console.log(error);
                res.status(500).json({
                    message: 'Fetching document name failed!'
                });
            });
        }
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            message: 'Fetching educational institution documents failed!'
        });
    });
};

const updateEducationalInstitutionDocument = (req, res, next) => {
    const newValues = {$set: {
        name: req.body.name,
        location: req.body.location,
        academy: req.body.academy,
        address: req.body.address,
        contactName: req.body.contactName,
        contactPhoneNumber: req.body.contactPhoneNumber,
        contactEmail: req.body.contactEmail,
        mentorName: req.body.mentorName,
        mentorPhoneNumber: req.body.mentorPhoneNumber,
        mentorEmail: req.body.mentorEmail,
        status: 'Ingevuld'
    }};

    EducationalInstitutionDocument.updateOne({_id: req.params.id, creator: req.userData.userId}, newValues)
    .then(result => {
        res.status(201).json({
            message: 'Educational institution document updated succesfully!',
            educationalInstitutionDocument: {
                ...result,
                id: result._id
            }
        });
    })
    .catch(error => {
        res.status(500).json({
            message: 'Updating an educational institution document failed!'
        });
    });
};


module.exports = {
    getEducationalInstitutionDocument,
    getEducationalInstitutionDocuments,
    updateEducationalInstitutionDocument
}