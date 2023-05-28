const User = require("../models/User");
const Post = require("../models/Post");
const Relationship = require("../models/Relationship");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const { getUrl, deleteImage } = require("../config/s3");

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

    if (otherData.profileImage) {
      const url = await getUrl(otherData.profileImage);
      otherData.profileImage = url;
    }

    if (otherData.coverImage) {
      const url = await getUrl(otherData.coverImage);
      otherData.coverImage = url;
    }

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
    const currentUser = jwt.verify(token, process.env.JWT_KEY);

    const relationship = await Relationship.findOne({
      sentBy: { $in: [currentUser._id, userId] },
      sentTo: { $in: [currentUser._id, userId] },
      status: "Accepted",
    });

    if (relationship || currentUser._id === userId) {
      const userPosts = await Post.find({ user: userId })
        .sort("-createdAt")
        .populate("user", "_id firstName lastName profileImage");

      for (const post of userPosts) {
        if (post.image) {
          const url = await getUrl(post.image);
          post.image = url;
        }
        if (post.user.profileImage) {
          const url = await getUrl(post.user.profileImage);
          post.user.profileImage = url;
        }
        if (post.user.coverImage) {
          const url = await getUrl(post.user.coverImage);
          post.user.coverImage = url;
        }
      }

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
    const currentUser = jwt.verify(token, process.env.JWT_KEY);

    if (currentUser._id !== req.body.userId) {
      return res.status(401).json({
        success: false,
        message: "You cannot update this profile!",
      });
    }

    const user = await User.findById(req.body.userId);
    if (req.body.profileImage) {
      await deleteImage(user.profileImage);
    }
    if (req.body.coverImage) {
      await deleteImage(user.coverImage);
    }

    await User.findByIdAndUpdate(req.body.userId, req.body);

    const { password, ...updatedData } = await User.findById(
      req.body.userId
    ).lean();

    if (updatedData.profileImage) {
      const url = await getUrl(updatedData.profileImage);
      updatedData.profileImage = url;
    }
    if (updatedData.coverImage) {
      const url = await getUrl(updatedData.coverImage);
      updatedData.coverImage = url;
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      token: jwt.sign(updatedData, process.env.JWT_KEY),
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
      })
        .find({ _id: { $ne: req.user._id } })
        .lean();
    } else {
      users = await User.find({
        firstName: { $regex: fname, $options: "i" },
      })
        .find({ _id: { $ne: req.user._id } })
        .lean();
    }
    const usersWithoutPassword = users?.map((user) => {
      const { password, ...otherData } = user;
      return otherData;
    });

    for (const user of usersWithoutPassword) {
      if (user.profileImage) {
        const url = await getUrl(user.profileImage);
        user.profileImage = url;
      }
    }
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
