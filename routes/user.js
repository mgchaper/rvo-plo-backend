const express = require("express");
const UserController = require("../controllers/user.controller");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");


router.post("/signup", UserController.createUser);
router.post("/login", UserController.userLogin);
router.post("/updateUser", checkAuth, UserController.updateUser);

module.exports = router;