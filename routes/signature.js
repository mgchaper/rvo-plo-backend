const express = require("express");
const router = express.Router();
const SignatureController = require ("../controllers/signature.controller");
const PdfController = require("../controllers/pdf.controller");
const checkAuth = require("../middleware/check-auth");
const extractFile = require("../middleware/file");

router.post("", checkAuth, extractFile, SignatureController.createSignature);

//
router.get("/:id", PdfController.getSignature);
//

module.exports = router;