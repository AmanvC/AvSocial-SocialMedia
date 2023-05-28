const Comment = require("../models/Comment");
const Like = require("../models/Like");
const jwt = require("jsonwebtoken");

const { getUrl } = require("../config/s3");

module.exports.getAllComments = async (req, res) => {
  try {
    const postId = req.query.postId;
    const comments = await Comment.find({ post: postId })
      .sort("createdAt")
      .lean()
      .populate("user", "_id firstName lastName profileImage");

    for (const comment of comments) {
      if (comment.user.profileImage) {
        const url = await getUrl(comment.user.profileImage);
        comment.user.profileImage = url;
      }
    }
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
    const user = jwt.verify(token, process.env.JWT_KEY);

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
    const user = jwt.verify(token, process.env.JWT_KEY);
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
    const commentId = req.query.commentId;
    const commentLikes = await Like.find({
      likeable: commentId,
      onModel: "Comment",
    });
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
    const user = jwt.verify(token, process.env.JWT_KEY);
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
    const user = jwt.verify(token, process.env.JWT_KEY);
    await Like.deleteOne({
      user: user._id,
      likeable: commentId,
      onModel: "Comment",
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
