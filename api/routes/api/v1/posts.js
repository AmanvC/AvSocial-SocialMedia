const express = require("express");
const router = express.Router();
const postsController = require("../../../controllers/postsController");

router.get("/", postsController.getPosts);
router.post("/", postsController.createPost);
router.delete("/", postsController.deletePost);

router.use("/comments", require("./comments"));

module.exports = router;
