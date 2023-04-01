module.exports.createSession = (req, res) => {
  return res.status(404).json({
    success: false,
    message: "User does not exist!",
  });
};
