module.exports.createStory = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Story created.",
  });
};

module.exports.getStories = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Story created.",
  });
};
