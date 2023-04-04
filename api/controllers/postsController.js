const Post = require("../models/Post");
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
