const Message = require("../models/Message");
const Chat = require("../models/Chat");

const { getUrl } = require("../config/s3");

module.exports.getAllMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({
      chat: chatId,
    })
      .populate("sender", "firstName lastName profileImage")
      .populate("chat");

    let signedUrlDone = [];

    for (const m of messages) {
      if (m.sender.profileImage) {
        if (signedUrlDone.indexOf(m.sender.id) === -1) {
          const url = await getUrl(m.sender.profileImage);
          m.sender.profileImage = url;
          signedUrlDone.push(m.sender.id);
        }
      }
    }
    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (err) {
    console.log("Error in GET ALL MESSAGES", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.createMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const newMessage = await Message.create({
      content,
      chat: chatId,
      sender: req.user._id,
    });
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: newMessage.id,
    });
    const popMessage = await Message.findById(newMessage.id)
      .populate("sender", "firstName lastName profileImage email")
      .populate({
        path: "chat",
        populate: {
          path: "latestMessage",
          populate: {
            path: "sender",
            select: { firstName: 1, lastName: 1, email: 1 },
          },
        },
      })
      .populate({
        path: "chat",
        populate: {
          path: "users",
          select: { firstName: 1, lastName: 1, profileImage: 1 },
        },
      });
    for (const user of popMessage.chat.users) {
      if (user.profileImage) {
        const url = await getUrl(user.profileImage);
        user.profileImage = url;
      }
    }
    return res.status(200).json({
      success: true,
      data: popMessage,
    });
  } catch (err) {
    console.log("Error in CREATE MESSAGE", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.updateMessage = async (req, res) => {
  try {
    const { messageId, updatedContent } = req.body;
    // const message = await Message.findById(messageId);
    // console.log(message);
    // console.log(message.sender == req.user._id);
    // if (message.sender != req.user._id) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "You cannot modify this message!",
    //   });
    // }
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      {
        content: updatedContent,
        isEdited: true,
      },
      { new: true }
    )
      .populate("sender", "firstName lastName profileImage")
      .populate("chat");
    return res.status(200).json({
      success: true,
      data: updatedMessage,
    });
  } catch (err) {
    console.log("Error in UPDATE MESSAGE", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.body;
    const deletedMessage = await Message.findByIdAndUpdate(
      messageId,
      {
        content: "",
        isEdited: false,
        isDeleted: true,
      },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      data: deletedMessage,
    });
  } catch (err) {
    console.log("Error in DELETE MESSAGE", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};
