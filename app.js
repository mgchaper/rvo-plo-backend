const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require ('dotenv');
dotenv.config();

const userRoutes = require("./routes/user");
const documentRoutes = require("./routes/documents");
const studentDocumentRoutes = require('./routes/student.documents');
const employerDocumentRoutes = require('./routes/employer.documents');
const educationalInstitutionDocumentRoutes = require('./routes/educationalInstitution.documents');
const mailRoutes = require('./routes/mail');
const signatureRoutes = require('./routes/signature');

const app = express();

mongoose
  .connect(
    process.env.MONGO_URL
  )
  .then(() => {
    console.log("Connected to database!");
  })
  .catch(() => {
    console.log('DatabaseURL = ' + process.env.MONGO_URL);
    console.log("Connection failed!");
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/user", userRoutes);
app.use("/api/document", documentRoutes);
app.use("/api/studentdocument", studentDocumentRoutes);
app.use('/api/employerdocument', employerDocumentRoutes);
app.use('/api/educationalinstitutiondocument', educationalInstitutionDocumentRoutes);
app.use('/api/signature', signatureRoutes);
module.exports = app;