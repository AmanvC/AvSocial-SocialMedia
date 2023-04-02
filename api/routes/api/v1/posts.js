const express = require("express");
const router = express.Router();
const postsController = require("../../../controllers/postsController");

router.get("/", postsController.getPosts);
router.post("/create", postsController.createPost);
router.use("/comments", require("./comments"));

module.exports = router;
