const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Like = require("../models/Like");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

module.exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .sort("-createdAt")
      .lean()
      .populate("user", "_id firstName lastName email");
    return res.status(200).json({
      success: true,
      message: "posts sent",
      data: posts,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.createPost = async (req, res) => {
  try {
    const data = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const user = jwt.verify(token, "secretkey");
    if (!data.image && !data.content) {
      return res.status(400).json({
        success: false,
        message: "Either image or content must be provided.",
      });
    }
    await Post.create({
      ...data,
      user: user._id,
    });
    return res.status(200).json({
      success: true,
      message: "Post created successfully.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.deletePost = async (req, res) => {
  try {
    const postId = req.query.postId;
    const token = req.headers.authorization.split(" ")[1];
    const user = jwt.verify(token, "secretkey");

    const post = await Post.findById(postId).populate("user");
    if (post.user.id !== user._id) {
      return res.status(401).json({
        success: false,
        message: "You cannot delete this post!",
      });
    }
    await Post.findByIdAndDelete(postId);
    await Comment.deleteMany({ post: postId });
    await Like.deleteMany({ likeable: postId });
    return res.status(200).json({
      success: true,
      message: "Post deleted successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.getPostLikes = async (req, res) => {
  try {
    const postId = req.query.postId;
    const likes = await Like.find({ likeable: postId, onModel: "Post" });
    const userIds = likes.map((like) => {
      return like.user;
    });
    return res.status(200).json({
      success: true,
      data: userIds,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.addPostLike = async (req, res) => {
  try {
    const postId = req.body.postId;
    const token = req.headers.authorization.split(" ")[1];
    const user = jwt.verify(token, "secretkey");
    await Like.create({
      user: user._id,
      likeable: postId,
      onModel: "Post",
    });
    return res.status(200).json({
      success: true,
      message: "Like added successfully!",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.deletePostLike = async (req, res) => {
  try {
    const postId = req.query.postId;
    const token = req.headers.authorization.split(" ")[1];
    const user = jwt.verify(token, "secretkey");
    await Like.findOneAndDelete({
      user: user._id,
      likeable: postId,
      onModel: "Post",
    });
    return res.status(200).json({
      success: true,
      message: "Like removed successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};
