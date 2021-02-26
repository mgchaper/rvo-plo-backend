const express = require("express");
const router = express.Router();
const SignatureController = require ("../controllers/signature.controller");
const checkAuth = require("../middleware/check-auth");
const extractFile = require("../middleware/file");

router.post("", checkAuth, extractFile, SignatureController.createSignature);

module.exports = router;