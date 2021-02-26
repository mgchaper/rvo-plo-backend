const { MAILJET_API, MAILJET_SECRET, MAILJET_MAIL, MAILJET_NAME, MAILJET_RECEIVER_EXAMPLE_MAIL, MAILJET_RECEIVE_EXAMPLE_NAME} = process.env;
const mailjet = require('node-mailjet').connect(MAILJET_API, MAILJET_SECRET);
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Document = require('../models/document');
const StudentDocument = require('../models/student.document');
const EducationalInstitutionDocument = require('../models/educationalInstitution.document');
const EmployerDocument = require('../models/employer.document');
const Role = require('../middleware/role');
const generatePassword = require('password-generator');

function createDocumentAccounts(document) {
	const student = new Object ({
		email: document.student,
		role: Role.Student
	});
	const educationalInstitution = new Object ({
		email: document.educationalInstitution,
		role: Role.EducationalInstitution
	});
	const employer = new Object ({
		email: document.employer,
		role: Role.Employer
	});

	const accounts = [];
	accounts.push(student);
	accounts.push(educationalInstitution);
	accounts.push(employer);

	accounts.forEach(account => {
		const password = generatePassword();
		bcrypt.hash(password, 10).then(hash => {
			const user = new User({
			  email: account.email,
			  password: hash,
			  role: account.role
			});
			user
			  .save()
			  .then(result => {
				  createSubDocuments(document, result);
				const request = mailjet
				.post("send", {'version': 'v3.1'})
				.request({
					"Messages":[
						{
							"From": {
								"Email": MAILJET_MAIL,
								"Name": MAILJET_NAME
							},
							"To": [
								{
									"Email": account.email,
									"Name": 'User'
								}
							],
							"TemplateID": 2067389,
							"TemplateLanguage": true,
							"Subject": "Praktijkleerovereenkomst: " + document.name,
							"Variables": {
								"wachtwoord": password
							}
						}
					]
				})
			request
				.then((result) => {
					console.log(result.body)
				})
				.catch((err) => {
					console.log(err.statusCode)
				});
			  })
			  .catch(err => {
			  });
		  });
	});
};

function createSubDocuments(document, account) {

	if(account.role === Role.Student) {
		const newValues = {$set: {studentId: account._id }}
		Document.updateOne({_id: document._id}, newValues)
		.then(result => {
			const studentDocument = new StudentDocument({
				documentId: document._id,
				creator: account._id,
			});
			studentDocument
			.save()
			.then(createdStudentDocument=> {
			})
			.catch(error =>{
				comsole.log(error);
			});

		});
	}else if(account.role === Role.Employer) {
		const newValues = {$set: {employerId: account._id }}
		Document.updateOne({_id: document._id}, newValues)
		.then(result => {
			const employerDocument = new EmployerDocument({
				documentId: document._id,
				creator: account._id,
			});
			employerDocument
			.save()
			.then(createdEmployerDocument=> {
			})
			.catch(error =>{
				comsole.log(error);
			});

		});

	}else if(account.role === Role.EducationalInstitution) {
		const newValues = {$set: {educationalInstitutionId: account._id }}
		Document.updateOne({_id: document._id}, newValues)
		.then(result => {
			const educationalInstitutionDocument = new EducationalInstitutionDocument({
				documentId: document._id,
				creator: account._id,
			});
			educationalInstitutionDocument
			.save()
			.then(createdEducationalInstitutionDocument=> {
			})
			.catch(error =>{
				comsole.log(error);
			});

		});

	} else {
		//TODO: Error handling
	}

}


function sendInvitations(document) {
	const accounts = [];
	accounts.push(document.student);
	accounts.push(document.educationalInstitution);
	accounts.push(document.employer);

	// accounts.forEach(account => {
        

	// });


    const accountsMap = new Map();

    accountsMap.push(document.student);
    accountsMap.push(document.educationalInstitution);
	accountsMap.push(document.employer);


    accountsMap.forEach(account => {
        const request = mailjet
	.post("send", {'version': 'v3.1'})
	.request({
		"Messages":[
			{
				"From": {
					"Email": MAILJET_MAIL,
					"Name": MAILJET_NAME
				},
				"To": [
					{
						"Email": MAILJET_RECEIVER_EXAMPLE_MAIL,
						"Name": MAILJET_RECEIVE_EXAMPLE_NAME
					}
				],
				"TemplateID": 2067389,
				"TemplateLanguage": true,
				"Subject": "Praktijkleerovereenkomst: " + document.name,
				"Variables": {}
			}
		]
	})
request
	.then((result) => {
		console.log(result.body)
	})
	.catch((err) => {
		console.log(err.statusCode)
	})
    })
};

module.exports = {
	sendInvitations,
	createDocumentAccounts
};

