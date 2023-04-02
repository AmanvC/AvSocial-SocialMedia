const express = require("express");

const router = express.Router();

const storiesController = require("../../../controllers/storiesController");

router.post("/create", storiesController.createStory);
router.get("/", storiesController.getStories);

module.exports = router;
