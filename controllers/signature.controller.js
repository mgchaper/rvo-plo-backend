const Signature = require("../models/signature");
const Student = require("../models/student.document");
const Employer = require("../models/employer.document");
const EducationalInstitution = require('../models/educationalInstitution.document');
const User = require("../models/user");
const Role = require('../middleware/role');

exports.createSignature = (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const signature = new Signature({
      name: req.body.name,
      function: req.body.function,
      location: req.body.location,
      date: req.body.date,
      imagePath: url + "/images/" + req.file.filename,
      creator: req.userData.userId
    });
    
    const updatedPathValues = {$set: {signaturePath: 'images/' + req.file.filename  }}

    User.findOne({_id: req.userData.userId})
    .then(foundUser => {
      if(foundUser.role === Role.Student) {
        Student.findOne({creator: foundUser._id})
        .then(studentDocument => {
          Student.updateOne({_id: studentDocument._id}, updatedPathValues)
          .then(result => {
            signature
            .save()
            .then(createdSignature => {
              res.status(201).json({
                message: "Signature added successfully",
                signature: {
                  ...createdSignature,
                  id: createdSignature._id
                }
              });
            })
            .catch(error => {
                console.log(error);
              res.status(500).json({
                message: "Creating a student signature failed!"
              });
            });
          });
        })
        .catch(error => {
          res.status(500).json({
            message: 'Could not find student document!'
          });
        });
      } else if (foundUser.role === Role.Employer) {
        Employer.findOne({creator: foundUser._id})
        .then(employerDocument => {
          Employer.updateOne({_id: employerDocument._id}, updatedPathValues)
          .then(result => {
            signature
            .save()
            .then(createdSignature => {
              res.status(201).json({
                message: "Signature added successfully",
                signature: {
                  ...createdSignature,
                  id: createdSignature._id
                }
              });
            })
            .catch(error => {
                console.log(error);
              res.status(500).json({
                message: "Creating an employer signature failed!"
              });
            });
          });
        })
        .catch(error => {
          res.status(500).json({
            message: 'Could not find employer document!'
          });
        });

      } else if (foundUser.role === Role.EducationalInstitution) {
        EducationalInstitution.findOne({creator: foundUser._id})
        .then(educationalInstitutionDocument => {
          EducationalInstitution.updateOne({_id: educationalInstitutionDocument._id}, updatedPathValues)
          .then(result => {
            signature
            .save()
            .then(createdSignature => {
              res.status(201).json({
                message: "Signature added successfully",
                signature: {
                  ...createdSignature,
                  id: createdSignature._id
                }
              });
            })
            .catch(error => {
                console.log(error);
              res.status(500).json({
                message: "Creating an educational institution signature failed!"
              });
            });
          });
        })
        .catch(error => {
          res.status(500).json({
            message: 'Could not find educational institution document!'
          });
        });
      };
    })
  };