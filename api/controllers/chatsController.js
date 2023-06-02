const Chat = require("../models/Chat");
const { deleteImage, getUrl } = require("../config/s3");

module.exports.createOrGet = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID missing!",
      });
    }
    const currentChat = await Chat.find({
      isGroupChat: false,
      users: { $all: [req.user._id, userId] },
    })
      .populate("users", "-password")
      .populate("latestMessage")
      .populate("latestMessage.sender", "-password");
    if (currentChat.length > 0) {
      return res.status(200).json({
        success: true,
        data: currentChat[0],
      });
    }
    const newChat = await Chat.create({
      chatName: "sender",
      isGroupChat: false,
      users: [userId, req.user._id],
    });
    const populatedChat = await Chat.findById(newChat.id).populate(
      "users",
      "-password"
    );
    return res.status(200).json({
      success: true,
      data: populatedChat,
    });
  } catch (err) {
    console.log("ERROR IN CREATEORGET", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.createGroupChat = async (req, res) => {
  try {
    const { chatName, users } = req.body;
    if (!chatName || users?.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Invalid request body!",
      });
    }
    const newChat = await Chat.create({
      chatName,
      isGroupChat: true,
      users: [...users, req.user._id],
      groupAdmins: [req.user._id],
    });

    const groupChatDetails = await Chat.findById(newChat._id)
      .populate("users", "-password")
      .populate("groupAdmins", "-password");

    return res.status(200).json({
      success: true,
      message: "Group chat created successfully.",
      data: groupChatDetails,
    });
  } catch (err) {
    console.log("ERROR IN CREATEGROUPCHAT", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.getAllChats = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const allChats = await Chat.find({
      users: { $elemMatch: { $eq: currentUserId } },
    })
      .populate("users", "-password")
      .populate("groupAdmins", "-password")
      .populate("latestMessage")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: { firstName: 1, lastName: 1 },
        },
      })
      .sort("-updatedAt")
      .sort("-createdAt");

    let signedUrlDone = [];

    for (const chat of allChats) {
      for (const user of chat.users) {
        if (signedUrlDone.indexOf(user.id) === -1) {
          if (user.profileImage) {
            const url = await getUrl(user.profileImage);
            user.profileImage = url;
            signedUrlDone.push(user.id);
          }
        }
      }
      for (const user of chat.groupAdmins) {
        if (signedUrlDone.indexOf(user.id) === -1) {
          if (user.profileImage) {
            const url = await getUrl(user.profileImage);
            user.profileImage = url;
            signedUrlDone.push(user.id);
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: allChats,
    });
  } catch (err) {
    console.log("ERROR IN GETALLCHATS", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.updateGroupChat = async (req, res) => {
  try {
    const groupChat = await Chat.findById(req.params.chatId);
    if (req.body.picture) {
      if (groupChat.picture) {
        await deleteImage(groupChat.picture);
      }
    }
    const updatedChat = await Chat.findByIdAndUpdate(
      req.params.chatId,
      req.body,
      { new: true } // to get updated object
    )
      .populate("users", "-password")
      .populate("groupAdmins", "-password");
    if (updatedChat.picture) {
      const url = await getUrl(updatedChat.picture);
      updatedChat.picture = url;
    }

    return res.status(200).json({
      success: true,
      message: "Group chat updated successfully.",
      data: updatedChat,
    });
  } catch (err) {
    console.log("ERROR IN UPDATE GROUP CHAT", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.addUser = async (req, res) => {
  try {
    const { userId, chatId } = req.body;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(400).json({
        success: false,
        message: "Group does not exist",
      });
    }
    const isUserAlreadyMember = await Chat.find({
      _id: chatId,
      users: { $elemMatch: { $eq: userId } },
    });
    if (isUserAlreadyMember.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User is already present in the group!",
      });
    }
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmins", "-password")
      .populate("latestMessage")
      .populate("latestMessage.sender", "-password");
    return res.status(200).json({
      success: true,
      message: "User added to the group.",
      data: updatedChat,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.removeUser = async (req, res) => {
  try {
    const { userId, chatId } = req.body;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(400).json({
        success: false,
        message: "Group does not exist",
      });
    }
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmins", "-password")
      .populate("latestMessage")
      .populate("latestMessage.sender", "-password");

    return res.status(200).json({
      success: true,
      message: "User removed from the group.",
      data: updatedChat,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.addAdmin = async (req, res) => {
  try {
    const { userId, chatId } = req.body;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(400).json({
        success: false,
        message: "Group does not exist",
      });
    }
    const isCurrentUserAdmin = await Chat.find({
      _id: chatId,
      isGroupChat: true,
      groupAdmins: { $elemMatch: { $eq: req.user._id } },
    });
    if (isCurrentUserAdmin.length < 1) {
      return res.status(400).json({
        success: false,
        message: "Only admins can make another user admin!",
      });
    }
    const isAddingUserAdmin = await Chat.find({
      _id: chatId,
      isGroupChat: true,
      groupAdmins: { $elemMatch: { $eq: userId } },
    });
    if (isAddingUserAdmin.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User is already group admin!",
      });
    }
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { groupAdmins: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmins", "-password")
      .populate("latestMessage")
      .populate("latestMessage.sender", "-password");
    return res.status(200).json({
      success: true,
      data: updatedChat,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.removeAdmin = async (req, res) => {
  try {
    const { userId, chatId } = req.body;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(400).json({
        success: false,
        message: "Chat does not exists!",
      });
    }
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { groupAdmins: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmins", "-password")
      .populate("latestMessage")
      .populate("latestMessage.sender", "-password");

    return res.status(200).json({
      success: true,
      message: "User removed as admin.",
      data: updatedChat,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};
