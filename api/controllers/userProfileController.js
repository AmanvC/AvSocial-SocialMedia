const User = require("../models/User");
const Post = require("../models/Post");
const Relationship = require("../models/Relationship");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

module.exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid user ID",
      });
    }
    const { password, ...otherData } = user;

    return res.status(200).json({
      success: true,
      userDetails: otherData,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.params.id;

    const token = req.headers.authorization.split(" ")[1];
    const currentUser = jwt.verify(token, "secretkey");

    const relationship = await Relationship.findOne({
      sentBy: { $in: [currentUser._id, userId] },
      sentTo: { $in: [currentUser._id, userId] },
      status: "Accepted",
    });

    if (relationship || currentUser._id === userId) {
      const userPosts = await Post.find({ user: userId }).populate(
        "user",
        "_id firstName lastName profileImage"
      );

      return res.status(200).json({
        success: true,
        userPosts: userPosts,
      });
    }

    return res.status(200).json({
      success: true,
      userPosts: null,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.updateUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const currentUser = jwt.verify(token, "secretkey");

    if (currentUser._id !== req.body.userId) {
      return res.status(401).json({
        success: false,
        message: "You cannot update this profile!",
      });
    }

    const user = await User.findById(req.body.userId);

    // remove current profile image if we have added a new image
    if (user.profileImage && user.profileImage !== req.body.profileImage) {
      fs.unlinkSync(
        path.join(__dirname, `../../client/public/uploads/${user.profileImage}`)
      );
    }

    // remove current cover image if we have added a new image
    if (user.coverImage && user.coverImage !== req.body.coverImage) {
      fs.unlinkSync(
        path.join(__dirname, `../../client/public/uploads/${user.coverImage}`)
      );
    }
    await User.findByIdAndUpdate(req.body.userId, req.body);

    const { password, ...updatedData } = await User.findById(
      req.body.userId
    ).lean();
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      token: jwt.sign(updatedData, "secretkey"),
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.searchUser = async (req, res) => {
  try {
    const searchQuery = req.query.username.split(" ");
    const result = searchQuery.filter((q) => q !== "");
    const fname = result[0];
    const lname = result[1];
    let users;
    if (lname) {
      users = await User.find({
        $and: [
          { firstName: { $regex: fname, $options: "i" } },
          { lastName: { $regex: lname, $options: "i" } },
        ],
      }).lean();
    } else {
      users = await User.find({
        firstName: { $regex: fname, $options: "i" },
      }).lean();
    }
    const usersWithoutPassword = users?.map((user) => {
      const { password, ...otherData } = user;
      return otherData;
    });
    return res.status(200).json({
      success: true,
      data: usersWithoutPassword,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};
