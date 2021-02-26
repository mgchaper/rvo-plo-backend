const express = require("express");
const EducationalInstitutionController = require('../controllers/educationalInstitution.document.controller');
const checkAuth = require('../middleware/check-auth');
const checkRole = require("../middleware/check-role");
const Role = require("../middleware/role");
const router = express.Router();

router.put("/:id", checkAuth, checkRole(Role.EducationalInstitution), EducationalInstitutionController.updateEducationalInstitutionDocument);
router.get("", checkAuth, checkRole(Role.EducationalInstitution), EducationalInstitutionController.getEducationalInstitutionDocuments);
router.get("/:id", checkAuth, checkRole(Role.EducationalInstitution), EducationalInstitutionController.getEducationalInstitutionDocument);

module.exports = router;