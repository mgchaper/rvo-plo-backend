const express = require("express");
const StudentController = require('../controllers/student.document.controller');
const checkAuth = require('../middleware/check-auth');
const checkRole = require("../middleware/check-role");
const Role = require("../middleware/role");


const router = express.Router();

router.put("/:id", checkAuth, checkRole(Role.Student), StudentController.updateStudentDocument);
router.get("", checkAuth, checkRole(Role.Student), StudentController.getStudentDocuments);
router.get("/:id", checkAuth, checkRole(Role.Student), StudentController.getStudentDocument);

module.exports = router;