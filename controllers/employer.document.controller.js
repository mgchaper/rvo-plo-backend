const Document = require('../models/document');
const EmployerDocument = require('../models/employer.document');

const getEmployerDocument = (req, res, next) => {
    EmployerDocument.findById(req.params.id)
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
                    message: 'Fetching document failed'
                });
            });
        } else {
            res.status(404).json({
                message: 'Employer document not found!'
            });
        }
    })
    .catch(error => {
        res.status(500).json({
            message: 'Fetching employer document failed!'
        });
    });
};

const getEmployerDocuments = (req, res, next) => {
    //Verschil tussen studenten en werkgevers, is dat werkgevers meerdere 
    //documenten kunnen hebben, doordat er meerdere studenten zijn
    //even navragen bij maurice of het daadwerkelijk zo is dat een bedrjif
    //meerdere aanvragen kan doen, of dat het gelimiteerd is tot 1
    const employerPageSize = + req.query.pagesize;
    const currentEmployerPage = + req.query.page;
    const employerQuery = EmployerDocument.find({creator: req.userData.userId});
    let fetchedEmployerDocuments;
    let fetchedDocumentsIncludingName = [];

    if(employerPageSize && currentEmployerPage) {
        employerQuery.skip(employerPageSize * (currentEmployerPage - 1)).limit(employerPageSize);
    }
    employerQuery
    .then(employerDocuments => {
        fetchedEmployerDocuments = employerDocuments;
        return EmployerDocument.find({creator: req.userData.id}).count();
    })
    .then(count => {
        for(i = 0; i < fetchedEmployerDocuments.length; i++) {
            let employerDocument = fetchedEmployerDocuments[i];
            Document.findOne({_id: fetchedEmployerDocuments[i].documentId})
            .then(foundDocument => {
                let document = {
                    documentName: foundDocument.name,
                    ...employerDocument._doc
                }
                fetchedDocumentsIncludingName.push(document);
                res.status(200).json({
                    message: 'Employer documents fetched successfully!',
                    employerDocuments: fetchedDocumentsIncludingName,
                    maxEmployerDocuments: count
                });
            })
        }
    })
    .catch(error => {
        res.status(500).json({
            message: 'Fetching employer documents failed!'
        });
    });

};

const updateEmployerDocument = (req, res, next) => {
    const newValues = {$set: {
        name: req.body.name,
        address: req.body.address,
        code: req.body.code,
        phoneNumber: req.body.phoneNumber,
        email: req.body.email,
        supervisorName: req.body.supervisorName,
        supervisorPhoneNumber: req.body.supervisorPhoneNumber,
        supervisorEmail: req.body.supervisorEmail,
        status: 'Ingevuld'      
    }};

    EmployerDocument.updateOne({_id: req.params.id, creator: req.userData.userId}, newValues)
    .then(result => {
        res.status(201).json({
            message: 'Employer document added succesfully!',
            employerDocument: {
                ...result,
                id: result._id
            }
        });
    })
    .catch(error => {
        res.status(500).json({
            message: 'Creating an employer document failed!'
        });
    });
};

module.exports = {
    getEmployerDocument,
    getEmployerDocuments,
    updateEmployerDocument
}