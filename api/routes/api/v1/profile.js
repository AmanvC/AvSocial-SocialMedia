const express = require("express");
const profileController = require("../../../controllers/userProfileController");
const router = express.Router();

router.get("/:id", profileController.getUserDetails);
router.patch("/update", profileController.updateUser);
router.get("/search/user", profileController.searchUser);

module.exports = router;
