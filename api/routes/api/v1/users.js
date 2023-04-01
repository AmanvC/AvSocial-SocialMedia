const express = require("express");
const router = express.Router();

const usersController = require("../../../controllers/usersController");

router.post("/create-session", usersController.createSession);
router.post("/create-user", usersController.createUser);

module.exports = router;
