const User = require("../models/User");
const Relationship = require("../models/Relationship");
const jwt = require("jsonwebtoken");

module.exports.getRelationshipStatus = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const currentUser = jwt.verify(token, "secretkey");

    const otherUserId = req.params.user_id;

    const relationship = await Relationship.findOne({
      sentBy: { $in: [currentUser._id, otherUserId] },
    });
    // console.log(relationship);
    return res.status(200).json({
      success: true,
      data: relationship,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.createRelationshipRequest = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const currentUser = jwt.verify(token, "secretkey");

    const otherUserId = req.body.user_id;
    const relationship = await Relationship.create({
      sentBy: currentUser._id,
      sentTo: otherUserId,
    });
    console.log(relationship);
    return res.status(200).json({
      success: true,
      message: "Friend request sent.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.acceptRelationship = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const currentUser = jwt.verify(token, "secretkey");

    const otherUserId = req.body.user_id;

    await Relationship.findOneAndUpdate(
      { sentBy: otherUserId, sentTo: currentUser._id },
      {
        status: "Accepted",
      }
    );
    return res.status(200).json({
      success: true,
      message: "Friend request accepted.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

// module.exports.deleteRelationshipRequest = (req, res) => {

// };

module.exports.deleteRelationship = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const currentUser = jwt.verify(token, "secretkey");

    const otherUserId = req.body.user_id;

    await Relationship.deleteOne({
      sentBy: { $in: [otherUserId, currentUser._id] },
      sentTo: { $in: [otherUserId, currentUser._id] },
    });
    return res.status(200).json({
      success: true,
      message: "Relationship deleted.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.pendingRelationships = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const user = jwt.verify(token, "secretkey");

    const relationships = await Relationship.find({
      sentTo: user._id,
      status: "Not Accepted",
    }).populate("sentBy", "_id firstName lastName profileImage");

    return res.status(200).json({
      success: true,
      data: relationships,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};
