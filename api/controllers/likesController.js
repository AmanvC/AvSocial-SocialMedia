const Like = require("../models/Like");

const jwt = require("jsonwebtoken");

module.exports.getLikes = async (req, res) => {
  try {
    const postId = req.query.postId;
    const likes = await Like.find({ likeable: postId });
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

module.exports.addLike = async (req, res) => {
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

module.exports.deleteLike = async (req, res) => {
  try {
    const postId = req.query.postId;
    const token = req.headers.authorization.split(" ")[1];
    const user = jwt.verify(token, "secretkey");
    await Like.findOneAndDelete({
      user: user._id,
      likeable: postId,
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
