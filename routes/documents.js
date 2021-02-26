const express = require("express");
const DocumentController = require("../controllers/document.controller");
const pdf = require('../controllers/pdf.controller');
const checkAuth = require("../middleware/check-auth");
const checkRole = require("../middleware/check-role");
const Role = require("../middleware/role");

const router = express.Router();

router.post("", checkAuth, DocumentController.createDocument);
router.put("/:id", checkAuth, checkRole(Role.Admin), DocumentController.updateDocument);
router.get("", checkAuth, checkRole(Role.Admin), DocumentController.getDocuments);
router.get("/:id", checkAuth, checkRole(Role.Admin), DocumentController.getDocument);
router.get("/status/:id", checkAuth, checkRole(Role.Admin), DocumentController.getStatus);
router.delete("/:id", checkAuth, checkRole(Role.Admin), DocumentController.deleteDocument);

//DIT IS ALLEEN VOOR OM TESTEN, ROUTE MAG NIET ZO OPEN ZIJN
router.post("/generate/:id", DocumentController.generateDocument);
//DIT IS ALLEEN VOOR OM TESTEN, ROUTE MAG NIET ZO OPEN ZIJN

router.get("/pdf/:id", checkAuth, pdf.getCompletePdf);

module.exports = router;