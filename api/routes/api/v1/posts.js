const express = require("express");
const router = express.Router();
const postsController = require("../../../controllers/postsController");

router.get("/", postsController.getPosts);
router.post("/", postsController.createPost);
router.delete("/", postsController.deletePost);
router.get("/likes", postsController.getPostLikes);
router.post("/like/create", postsController.addPostLike);
router.delete("/like/delete", postsController.deletePostLike);

router.use("/comments", require("./comments"));

module.exports = router;
