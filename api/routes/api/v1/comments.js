const express = require("express");
const router = express.Router();

const commentsController = require("../../../controllers/commentsController");

router.get("/", commentsController.getAllComments);
router.post("/create", commentsController.createComment);
router.delete("/delete", commentsController.deleteComment);
router.get("/like", commentsController.getAllCommentLikes);
router.post("/create/like", commentsController.likeComment);
router.delete("/delete/like", commentsController.unlikeComment);

module.exports = router;
