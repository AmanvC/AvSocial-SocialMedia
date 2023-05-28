const Story = require("../models/Story");
const jwt = require("jsonwebtoken");

const { getUrl, deleteImage } = require("../config/s3");

module.exports.getStories = async (req, res) => {
  try {
    const stories = await Story.find({})
      .populate("user", "_id firstName lastName")
      .sort("-createdAt");
    for (const story of stories) {
      const url = await getUrl(story.image);
      story.image = url;
    }
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
    const user = jwt.verify(token, process.env.JWT_KEY);
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
    const user = jwt.verify(token, process.env.JWT_KEY);
    const story = await Story.findById(storyId);
    if (story.user != user._id) {
      return res.status(401).json({
        success: false,
        message: "You cannot delete this story!",
      });
    }
    const isImageDeleted = await deleteImage(story.image);
    if (!isImageDeleted) {
      return res.status(500).json({
        success: false,
        message: "Internal server error!",
      });
    }
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
