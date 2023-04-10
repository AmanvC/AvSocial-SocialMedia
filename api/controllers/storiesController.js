const Story = require("../models/Story");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

module.exports.getStories = async (req, res) => {
  try {
    const stories = await Story.find({}).populate("user").sort("-createdAt");
    return res.status(200).json({
      success: true,
      stories: stories,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.createStory = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const user = jwt.verify(token, "secretkey");
    const image = req.body.image;

    await Story.create({
      image,
      user: user._id,
    });
    return res.status(200).json({
      success: true,
      message: "Story created successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.deleteStory = async (req, res) => {
  try {
    const storyId = req.query.storyId;
    const token = req.headers.authorization.split(" ")[1];
    const user = jwt.verify(token, "secretkey");
    const story = await Story.findById(storyId).populate("user");
    if (story.user.id !== user._id) {
      return res.status(401).json({
        success: false,
        message: "You cannot delete this story!",
      });
    }
    fs.unlinkSync(
      path.join(__dirname, `../../client/public/uploads/${story.image}`)
    );
    await Story.findByIdAndDelete(storyId);
    return res.status(200).json({
      success: true,
      message: "Story deleted successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};
