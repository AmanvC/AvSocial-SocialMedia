const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Like = require("../models/Like");
const Relationship = require("../models/Relationship");
const jwt = require("jsonwebtoken");

const { getUrl, deleteImage } = require("../config/s3");

module.exports.getPosts = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const user = jwt.verify(token, process.env.JWT_KEY);

    const { page, timestamp } = req.query;

    // Get all relationships that are sent by current user
    const relationshipsSent = await Relationship.find({
      sentBy: user._id,
      status: "Accepted",
    });

    // Get all relationships that are received by current user
    const relationshipsReceived = await Relationship.find({
      sentTo: user._id,
      status: "Accepted",
    });

    // map through all relationships and get ids of users
    const sentIds = relationshipsSent.map((rel) => rel.sentTo);
    const receivedIds = relationshipsReceived.map((rel) => rel.sentBy);

    // get all posts
    const query = timestamp
      ? {
          user: { $in: [...sentIds, ...receivedIds, user._id] },
          createdAt: { $lte: new Date(timestamp) },
        }
      : { user: { $in: [...sentIds, ...receivedIds, user._id] } };

    const allPosts = await Post.find(query)
      .sort("-createdAt")
      .skip((parseInt(page) - 1) * 10)
      .limit(10)
      .populate("user", "_id firstName lastName profileImage");

    let nextPage = false;
    const nextPosts = await Post.find(query).skip(page * 10);
    if (nextPosts.length > 0) {
      nextPage = true;
    }

    let signedUrlDone = [];

    for (const post of allPosts) {
      if (post.image) {
        const url = await getUrl(post.image);
        post.image = url;
      }
      if (signedUrlDone.indexOf(post.user.id) === -1) {
        if (post.user.profileImage) {
          const url = await getUrl(post.user.profileImage);
          post.user.profileImage = url;
          signedUrlDone.push(post.user.id);
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: allPosts,
      nextPage: nextPage ? parseInt(page) + 1 : null,
      // prevPage: page === 1 ? false : true,
      timestamp: allPosts[0]?.createdAt,
      // allposts[0] because we are skipping 10 in each call, so if we checked with the last object that was created, then in the next iteration, the first 10 posts that were created after that post will get skipped
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
    const user = jwt.verify(token, process.env.JWT_KEY);
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
    const user = jwt.verify(token, process.env.JWT_KEY);

    const post = await Post.findById(postId).populate("user");
    if (post.user.id !== user._id) {
      return res.status(401).json({
        success: false,
        message: "You cannot delete this post!",
      });
    }

    if (post.image) {
      const isImageDeleted = await deleteImage(post.image);
      if (!isImageDeleted) {
        return res.status(500).json({
          success: false,
          message: "Internal server error!",
        });
      }
    }

    // delete comment likes
    const comments = await Comment.find({ post: postId });
    comments.forEach(async (comment) => {
      await Like.deleteMany({ likeable: comment.id });
    });

    // delete post likes
    await Like.deleteMany({ likeable: postId });

    // delete post comments
    await Comment.deleteMany({ post: postId });

    // delete post
    await Post.findByIdAndDelete(postId);

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
    const user = jwt.verify(token, process.env.JWT_KEY);
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
    const user = jwt.verify(token, process.env.JWT_KEY);
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
