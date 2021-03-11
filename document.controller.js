const Document = require('../models/document');
const StudentDocument = require('../models/student.document');
const EducationalInstitutionDocument = require('../models/educationalInstitution.document');
const EmployerDocument = require('../models/employer.document');
const Signature = require('../models/signature');
const pdf = require('./pdf.controller');
const mail = require ('./mail.controller');
const user = require('../models/user');
const { Student } = require('../middleware/role');

const mongoose = require('mongoose');
const GridFsStorage = require('multer-gridfs-storage');
const fs = require('fs');
const Grid = require('gridfs-stream');

const conn = mongoose.createConnection(process.env.MONGO_URL);
conn.once('open', () => {
    // Init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('signatureImages');
  });

const fonts = {
    Roboto: {
        normal: 'fonts/roboto/Roboto-Regular.ttf',
        bold: 'fonts/roboto/Roboto-Bold.ttf',
        italics: 'fonts/roboto/Roboto-Italic.ttf',
        bolditalics: 'fonts/roboto/Roboto-BoldItalic.ttf'
    }
};

var PdfPrinter = require('pdfmake');
var printer = new PdfPrinter(fonts);


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
                    gfs.files.findOne({filename: foundStudentDocument.signaturePath}, (err, file) => {
                        if (!file || file.length === 0) {
                            console.log(err);
                        } else {
                            if(file.contentType === "image/jpeg" || file.contentType === "image/png"){
                                const readstream = gfs.createReadStream(file.filename);
                                const bufs = [];
                                readstream.on('data', function (chunk) {
                                    bufs.push(chunk);
                                });
                                readstream.on('end', function () {
                                    const fbuf = Buffer.concat(bufs);
                                    const base64 = fbuf.toString('base64');
                                    studentSignature = 'data:image/jpeg;base64,' + base64;
                                    gfs.files.findOne({filename: foundEducationalInstitutionDocument.signaturePath}, (err, file) => {
                                        if (!file || file.length === 0) {
                                            console.log(err);
                                        } else {
                                            if(file.contentType === "image/jpeg" || file.contentType === "image/png"){
                                                const readstream = gfs.createReadStream(file.filename);
                                                const bufs = [];
                                                readstream.on('data', function (chunk) {
                                                    bufs.push(chunk);
                                                });
                                                readstream.on('end', function () {
                                                    const fbuf = Buffer.concat(bufs);
                                                    const base64 = fbuf.toString('base64');
                                                    educationalInstitutionSignature = 'data:image/jpeg;base64,' + base64;
                                                    gfs.files.findOne({filename: foundEmployerDocument.signaturePath}, (err, file) => {
                                                        if (!file || file.length === 0) {
                                                            console.log(err);
                                                        } else {
                                                            if(file.contentType === "image/jpeg" || file.contentType === "image/png"){
                                                                const readstream = gfs.createReadStream(file.filename);
                                                                const bufs = [];
                                                                readstream.on('data', function (chunk) {
                                                                    bufs.push(chunk);
                                                                });
                                                                readstream.on('end', function () {
                                                                    const fbuf = Buffer.concat(bufs);
                                                                    const base64 = fbuf.toString('base64');
                                                                    employerSignature = 'data:image/jpeg;base64,' + base64;
                                                                    
                                                                    document = foundDocument;
                                                                    studentDocument = foundStudentDocument;
                                                                    educationalInstitutionDocument = foundEducationalInstitutionDocument;
                                                                    employerDocument = foundEmployerDocument;
                                                                    
                                                                            var docDefinition = {
                                                                                content: [
                                                                                    '\n\n\n\n\n\n\n',
                                                                                    {
                                                                                        text: 'Praktijkleerovereenkomst',
                                                                                        style: 'header'
                                                                                    },
                                                                                    '\n\n\n',
                                                                                    {
                                                                                        text: 'Partijen: ',
                                                                                        style: 'subheader'
                                                                                    },
                                                                                    '\n\n\n',
                                                                                    {
                                                                                        text: 'Student',
                                                                                        style: 'subheader2'
                                                                                    },
                                                                                    {
                                                                                        columns: [
                                                                                            {
                                                                                                width: 200,
                                                                                                text: '- Familienaam \n \
                                                                                                - Voorletters \n \
                                                                                                - Voornaam \n \
                                                                                                - Geboortedatum \n \
                                                                                                - Geslacht \n \
                                                                                                - Telefoonnummer \n \
                                                                                                - E-mail \n \
                                                                                                - Adres \n \
                                                                                                - Postcode \n \
                                                                                                - Woonplaats \n \
                                                                                                \n\n \
                                                                                                en \n\n \
                                                                                                ',
                                                                                            },
                                                                                            {
                                                                                                width: '*',
                                                                                                text: ': ' + studentDocument.lastName + ' \n \
                                                                                                : ' + studentDocument.initials + '\n \
                                                                                                : ' + studentDocument.firstName + '\n \
                                                                                                : ' + studentDocument.dob + '\n \
                                                                                                : ' + studentDocument.sex + '\n \
                                                                                                : ' + studentDocument.phoneNumber + '\n \
                                                                                                : ' + studentDocument.email + '\n \
                                                                                                : ' + studentDocument.address + '\n \
                                                                                                : ' + studentDocument.zipCode + '\n \
                                                                                                : ' + studentDocument.city
                                                                                            },
                                                                                        ],
                                                                                    },
                                                                                    
                                                                                    {
                                                                                        text: 'Onderwijsinstelling',
                                                                                        style: 'subheader2'
                                                                                    },
                                                                                    {
                                                                                        columns: [
                                                                                            {
                                                                                                width: 200,
                                                                                                text: '- Naam \n \
                                                                                                - Locatie \n \
                                                                                                - Academie \n \
                                                                                                - Bezoekadres \n \
                                                                                                - Contactpersoon \n \
                                                                                                - Telefoonnummer \n \
                                                                                                - E-mail \n \
                                                                                                - Onderwijsbegeleider \n \
                                                                                                - Postcode \n \
                                                                                                - Woonplaats \n \
                                                                                                \n\n \
                                                                                                en \n\n \
                                                                                                ',
                                                                                            },
                                                                                            {
                                                                                                width: '*',
                                                                                                text: ': ' + educationalInstitutionDocument.name + ' \n \
                                                                                                : ' + educationalInstitutionDocument.location + '\n \
                                                                                                : ' + educationalInstitutionDocument.academy + '\n \
                                                                                                : ' + educationalInstitutionDocument.address + '\n \
                                                                                                : ' + educationalInstitutionDocument.contactName + '\n \
                                                                                                : ' + educationalInstitutionDocument.contactPhoneNumber + '\n \
                                                                                                : ' + educationalInstitutionDocument.contactEmail + '\n \
                                                                                                : ' + educationalInstitutionDocument.mentorName + '\n \
                                                                                                : ' + educationalInstitutionDocument.mentorPhoneNumber + '\n \
                                                                                                : ' + educationalInstitutionDocument.mentorEmail
                                                                                            },
                                                                                        ],
                                                                                    },
                                                                                    {
                                                                                        text: 'Praktijk biedende organisatie',
                                                                                        style: 'subheader2'
                                                                                    },
                                                                                    {
                                                                                        columns: [
                                                                                            {
                                                                                                width: 200,
                                                                                                text: '- Naam organisatie \n \
                                                                                                - Adres \n \
                                                                                                - Code leerbedrijf \n \
                                                                                                - Telefoonnummer \n \
                                                                                                - E-mail \n \
                                                                                                - Naam praktijkbegeleider \n \
                                                                                                - Telefoonnummer \n \
                                                                                                - E-mail \n \
                                                                                                \n\n \
                                                                                                ',
                                                                                            },
                                                                                            {
                                                                                                width: '*',
                                                                                                text: ': ' + employerDocument.name + ' \n \
                                                                                                : ' + employerDocument.address + '\n \
                                                                                                : ' + employerDocument.code + '\n \
                                                                                                : ' + employerDocument.phoneNumber + '\n \
                                                                                                : ' + employerDocument.email + '\n \
                                                                                                : ' + employerDocument.supervisorName + '\n \
                                                                                                : ' + employerDocument.supervisorPhoneNumber + '\n \
                                                                                                : ' + employerDocument.supervisorEmail 
                                                                                            },
                                                                                        ],
                                                                                    },
                                                                                    
                                                                                    {
                                                                                        text: 'Sluiten een praktijkleerovereenkomst om de praktijkvorming behorende bij de in artikel 1 genoemde opleiding vorm te geven.',
                                                                                        style: ['quote', 'small']
                                                                                    },
                                                                                    '\n\n',
                                                                                    {
                                                                                        text: 'Artikel 1. Opleiding',
                                                                                        style: 'subheader2'
                                                                                    },
                                                                                    {
                                                                                        columns: [
                                                                                            {
                                                                                                width: 200,
                                                                                                text: '- Opleidingsnaam \n \
                                                                                                - Opleidingsvorm \n \
                                                                                                - Opleidingsniveau \n \
                                                                                                - CROHO-nummer \n \
                                                                                                \n\n \
                                                                                                ',
                                                                                            },
                                                                                            {
                                                                                                width: '*',
                                                                                                text: ': ' + document.educationalName + ' \n \
                                                                                                : ' + document.educationalForm + '\n \
                                                                                                : ' + document.educationalAttainment + '\n \
                                                                                                : ' + document.CROHONumber 
                                                                                            },
                                                                                        ],
                                                                                    },
                                                                                    {
                                                                                        text: 'Artikel 2. Duur en omvang',
                                                                                        style: 'subheader2'
                                                                                    },
                                                                                    {
                                                                                        columns: [
                                                                                            {
                                                                                                width: 200,
                                                                                                text: '- Ingangsdatum praktijk \n \
                                                                                                - Einddatum praktijk \n \
                                                                                                - Totaal aantal klokuren \n \
                                                                                                - CROHO-nummer \n \
                                                                                                \n',
                                                                                            },
                                                                                            {
                                                                                                width: '*',
                                                                                                text: ': ' + document.startDate + ' \n \
                                                                                                : ' + document.endDate + '\n \
                                                                                                : ' + document.clockHours + '\n \
                                                                                                : ' + document.CROHONumber 
                                                                                            },
                                                                                        ],
                                                                                    },
                                                                                    {
                                                                                        text: "Waar in het vervolg van deze praktijkleerovereenkomst sprake is van 'opleiding' wordt daarmee bedoeld de kwalificatie zoals genoemd in hoofdstuk 1 van de Onderwijs- en Examenregeling van de betreffende opleiding van de onderwijsinstelling. \n\n"
                                                                                    },
                                                                                    {
                                                                                      text: 'Artikel 3. Inboud van de praktijkleerovereenkomst \n\n',
                                                                                      style: 'subheader2'
                                                                                    },
                                                                                    {
                                                                                        ol: [
                                                                                            'Uitgangspunt van de beroepspraktijkvorming zijn de voor de opleiding geldende opleidingsdoelen zoals opgenomen in de Onderwijs- en Examenregeling van de opleiding.',
                                                                                            'Voortgang van de opleiding word bijgehouden in het Studenteninformatiesysteem, Osiris. De wijze waarop studenten worden begeleidt is opgenomen in de Onderwijsen Examenregeling van de opleiding.']
                                                                                    },
                                                                                    {
                                                                                        text: '\n Artikel 4. Voorwaarden \n\n',
                                                                                        style: 'subheader2'
                                                                                    },
                                                                                    {
                                                                                        ol: [
                                                                                            'De student is verplicht de binnen de praktijk biedende organisatie geldende regels, voorschriften en aanwijzingen in het belang van orde en veiligheid en gezondheid in acht te nemen. De praktijk biedende organisatie dient deze gedragsregels kenbaar te maken aan student.',
                                                                                            'De student is verplicht alles geheim te houden wat hem onder geheimhouding wordt toevertrouwd door de praktijk biedende organisatie of wat er als geheim te zijner kennis is gekomen of waarvan hij het vertrouwelijke karakter redelijkerwijs moet begrijpen.',
                                                                                            'De praktijk biedende organisatie treft maatregelen die gericht zijn op de bescherming van de lichamelijke en geestelijke integriteit van de student en ter voorkoming of bestrijding van vormen van intimidatie, discriminatie, agressie en geweld.',
                                                                                            'Voor afwezigheid tijdens de beroepspraktijkvorming gelden voor de student de bepalingen die daaromtrent zijn opgenomen in de Onderwijs- en Examenregeling van de opleiding en in de eventuele huisregels van de sector. Tevens is de student verplicht in geval van afwezigheid en bij terugkomst van afwezigheid onverwijld de praktijkopleider hiervan op de hoogte te stellen, conform de regels van de praktijk biedende organisatie.']
                                                                                    },
                                                                                    {
                                                                                        text: '\n Artikel 5. Beëindiging overeenkomst \n\n',
                                                                                        style: 'subheader2'
                                                                                    },
                                                                                    {
                                                                                        ol: [
                                                                                            'Deze overeenkomst eindigt: \n \
                                                                                            a.   Aan het einde van de in de overeenkomst overeengekomen periode.\n \
                                                                                            b.   Zodra de student zijn inschrijving beëindigt als student van Avans Hogeschool.\n \
                                                                                            c.   Bij onderling goedvinden van partijen.\n \
                                                                                            d.   Bij overlijden van de stagiair.\n \
                                                                                            e.   Bij faillissement, surseance of ontbinding van de praktijk biedende organisatie.\n \
                                                                                            f.   Het beëindigen van de onderwijsovereenkomst tussen student en de onderwijsinstelling.\n \
                                                                                            g.   Het verbreken van de arbeidsovereenkomst tussen leerbedrijf en student indien er een dwingende koppeling is geweest tussen de praktijkovereenkomst en de arbeidsovereenkomst.',
                                                                                            'De opleiding is gerechtigd, gehoord de praktijkbegeleider en de betrokken student, deze overeenkomst terstond te beëindigen en de student terug te trekken: \n \
                                                                                            a.   Indien de student naar het oordeel van de praktijk biedende organisatie herhaaldelijk -en ondanks waarschuwing- de voorschriften of aanwijzingen van de bedrijfsbegeleider niet opvolgt en/of zich anderszins zodanig gedraagt dat van de stageverlener redelijkerwijs niet kan worden verlangd dat hij zijn medewerking aan de stage blijft verlenen.\n \
                                                                                            b.   Indien de stagiair zijn geheimhoudingsplicht jegens de stageverlener niet nakomt.\n \
                                                                                            Van een beslissing als vermeld onder a en b geeft de stageverlener door tussenkomst van de praktijkbegeleider onverwijld kennis aan de onderwijsinstelling.',
                                                                                            'De opleiding is gerechtigd, gehoord de praktijkbegeleider en de betrokken student, deze overeenkomst terstond te beëindigen en de student terug te trekken: \n \
                                                                                            a.   Indien naar het oordeel van de opleiding de praktijkvorming niet voldoet aan de onderwijsdoelstellingen of anderszins niet verloopt in overeenstemming met wat is afgesproken in deze overeenkomst dan wel van de student redelijkerwijs niet gevraagd kan worden zijn praktijkvorming bij de praktijk biedende organisatie voort te zetten.\n \
                                                                                            b.   Wanneer regelingen met betrekking tot de privacy en ongewenste omgangsvormen zijn geschonden.\n \
                                                                                            Van een dergelijke beslissing stelt de opleiding door tussenkomst van de contactpersoon onverwijld de praktijkbegeleider in kennis.',
                                                                                            'De student is gerechtigd, na afstemming met de contactpersoon vanuit de onderwijsinstelling en de praktijkbegeleider, deze overeenkomst terstond te beëindigen indien in redelijkheid van de student niet gevergd kan worden dat deze de praktijkvorming verder zal voortzetten. \n\n'
                                                                                            ]
                                                                                    },
                                                                                    {
                                                                                        text: 'Artikel 6. Toepasselijk recht\n\n',
                                                                                        style: 'subheader2'
                                                                                    },
                                                                                    { text:'In de gevallen waarin deze overeenkomst niet voorziet beslist het bevoegd gezag na overleg met de student en de praktijk biedende organisatie. Op deze overeenkomst is uitsluitend het Nederlands recht van toepassing.\n\n'},
                                                                                    {
                                                                                        text: 'Ondertekening\n\n',
                                                                                        style: 'subheader2'
                                                                                    },
                                                                                    {text: 'De student, de praktijk biedende organisatie en de onderwijsinstelling verklaren door middel van ondertekening dat ze akkoord zijn met de inhoud van deze Praktijkleerovereenkomst.\n\n'},
                                                                                    {text: 'Student', style: 'subheader'},
                                                                                    {text: 'Naam: ' + studentDocument.firstName + ' ' + studentDocument.lastName },
                                                                                    {text: 'Plaats: ' + studentDocument.city},
                                                                                    {text: 'Datum: ' + new Date().toLocaleDateString()},
                                                                                    {text: 'Handtekening: \n\n\n\n'},
                                                                                    {image: studentSignature,
                                                                                    width: 200 },
                                                                                    {text: 'Onderwijsinstelling', style:'subheader'},
                                                                                    {text: ', in deze rechtsgeldig vertegenwoordigd door:\n\n'},
                                                                                    {text: 'Naam: ' + educationalInstitutionDocument.contactName},
                                                                                    {text: 'Functie: '},
                                                                                    {text: 'Plaats: ' + educationalInstitutionDocument.location},
                                                                                    {text: 'Datum: ' + new Date().toLocaleDateString()},
                                                                                    {text: 'Handtekening: \n\n\n\n'},
                                                                                    {image: educationalInstitutionSignature,
                                                                                    width: 200 },
                                                                                    {text: 'Praktijk biedende organistatie', style:'subheader'},
                                                                                    {text: ', in deze rechtsgeldig vertegenwoordigd door:\n\n'},
                                                                                    {text: 'Naam: ' + employerDocument.supervisorName},
                                                                                    {text: 'Functie: '},
                                                                                    {text: 'Plaats: '},
                                                                                    {text: 'Datum: ' + new Date().toLocaleDateString()},
                                                                                    {text: 'Handtekening: \n\n'},
                                                                                    {image: employerSignature,
                                                                                    width: 200 },
                                                                                    {text: 'De praktijk biedende organisatie, de onderwijsinstelling en de student ontvangen een door alle partijen getekende versie van de overeenkomst.'}
                                                                                    
                                                                                ],
                                                                                styles: {
                                                                                    header: {
                                                                                        fontSize: 18,
                                                                                        bold: true
                                                                                    },
                                                                                    subheader: {
                                                                                        fontSize: 15,
                                                                                        bold: true
                                                                                    },
                                                                                    subheader2: {
                                                                                        fontSize: 15,
                                                                                        bold: true,
                                                                                        decoration: 'underline'
                                                                                    },
                                                                                    bigger: {
                                                                                        fontSize: 15,
                                                                                        italics: true
                                                                                    },
                                                                                    quote: {
                                                                                    italics: true
                                                                                    },
                                                                                    small: {
                                                                                        fontSize: 8
                                                                                    }
                                                                                },
                                                                                defaultStyle: {
                                                                                    columnGap: 20
                                                                                }
                                                                            };
                                                                    
                                                                            var pdfDoc = printer.createPdfKitDocument(docDefinition);
                                                                             var chunks = []
                                                                             var result
                                                                             pdfDoc.on('data', function (chunk) 
                                                                             {
                                                                                 chunks.push(chunk)
                                                                                });
                                                                                pdfDoc.on('end', function () {
                                                                                    result = Buffer.concat(chunks)
                                                                                    res.contentType('application/pdf')
                                                                                    res.send(result)
                                                                                });
                                                                                pdfDoc.end()
                                                                    // pdf.generatePdf(
                                                                    //     foundDocument, 
                                                                    //     foundStudentDocument,
                                                                    //     foundEducationalInstitutionDocument,
                                                                    //     foundEmployerDocument,
                                                                    //     studentSignature,
                                                                    //     educationalInstitutionSignature,
                                                                    //     employerSignature);
                                                                });
                                                            }; 
                                                        };
                                                    });
                                                });
                                            }; 
                                        };
                                    });
                                });
                            }; 
                        };
                    });
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