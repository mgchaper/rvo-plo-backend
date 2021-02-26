const express = require("express");
const EmployerController = require('../controllers/employer.document.controller');
const checkAuth = require('../middleware/check-auth');
const checkRole = require("../middleware/check-role");
const Role = require("../middleware/role");
const router = express.Router();

router.put("/:id", checkAuth, checkRole(Role.Employer), EmployerController.updateEmployerDocument);
router.get("", checkAuth, checkRole(Role.Employer), EmployerController.getEmployerDocuments);
router.get("/:id", checkAuth, checkRole(Role.Employer), EmployerController.getEmployerDocument);

module.exports = router;

