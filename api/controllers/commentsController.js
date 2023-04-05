const Comment = require("../models/Comment");
const Like = require("../models/Like");
const jwt = require("jsonwebtoken");

module.exports.getAllComments = async (req, res) => {
  try {
    const postId = req.query.postId;
    const comments = await Comment.find({ post: postId })
      .sort("-createdAt")
      .lean()
      .populate("user", "_id firstName lastName");
    return res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.createComment = async (req, res) => {
  try {
    const postId = req.query.postId;
    const content = req.body.content;
    const token = req.headers.authorization.split(" ")[1];
    const user = jwt.verify(token, "secretkey");

    await Comment.create({
      content,
      post: postId,
      user: user._id,
    });
    return res.status(200).json({
      success: true,
      message: "Comment created successfully.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.query.commentId;
    const token = req.headers.authorization.split(" ")[1];
    const user = jwt.verify(token, "secretkey");
    const comment = await Comment.findById(commentId).populate("user");

    if (comment.user.id !== user._id) {
      return res.status(401).json({
        success: false,
        message: "You cannot delete this comment!",
      });
    }
    await Comment.findByIdAndDelete(commentId);
    await Like.deleteMany({
      user: user._id,
      likeable: commentId,
      onModel: "Comment",
    });
    return res.status(200).json({
      success: true,
      message: "Comment and associated likes deleted successfully.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.getAllCommentLikes = async (req, res) => {
  try {
    const postId = req.query.commentId;
    const commentLikes = await Like.find({
      likeable: postId,
      onModel: "Comment",
    });
    console.log(commentLikes);
    const userIds = commentLikes.map((like) => like.user);
    return res.status(200).json({
      success: true,
      data: userIds,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.likeComment = async (req, res) => {
  try {
    const commentId = req.query.commentId;
    const token = req.headers.authorization.split(" ")[1];
    const user = jwt.verify(token, "secretkey");
    await Like.create({
      user: user._id,
      likeable: commentId,
      onModel: "Comment",
    });
    return res.status(200).json({
      success: true,
      message: "Like added to comment successfully.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports.unlikeComment = async (req, res) => {
  try {
    const commentId = req.query.commentId;
    const token = req.headers.authorization.split(" ")[1];
    const user = jwt.verify(token, "secretkey");

    console.log(commentId);
    const comment = await Comment.findById(commentId).populate("user");
    console.log(comment);
    if (comment.user.id !== user._id) {
      return res.status(401).json({
        success: false,
        message: "You cannot remove this like.",
      });
    }
    await Like.findByIdAndDelete({
      user: user._id,
      likeable: commentId,
    });
    return res.status(200).json({
      success: true,
      message: "Like on comment removed successfully.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};
