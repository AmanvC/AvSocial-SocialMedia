const express = require("express");

const router = express.Router();

const storiesController = require("../../../controllers/storiesController");

router.get("/", storiesController.getStories);
router.post("/create", storiesController.createStory);
router.delete("/delete", storiesController.deleteStory);

module.exports = router;
