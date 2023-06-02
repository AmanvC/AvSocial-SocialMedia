import React, { useContext } from "react";
import "./userDetailsCard.scss";
import { ChatContext } from "../../context/chatContext";
import { getSenderDetails, getSenderName } from "../../utils/chatLogic";
import GroupImage from "../../assets/group.png";
import NoUserImage from "../../assets/NoUserImage.png";
import { AuthContext } from "../../context/authContext";
import Img from "../lazyLoadImage/Img";

const UserDetailsCard = ({ chat }) => {
  const { selectedChat, setSelectedChat } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);

  return (
    <div
      className={`user-details-card ${
        selectedChat?._id === chat?._id && "selected-chat"
      }`}
      onClick={() => setSelectedChat(chat)}
    >
      <div className="image">
        <Img
          src={
            chat?.isGroupChat
              ? chat?.profileImage || GroupImage
              : getSenderDetails(currentUser, chat.users)?.profileImage ||
                NoUserImage
          }
        />
      </div>
      <div className="details">
        <p className="chat-name">
          {chat?.isGroupChat
            ? chat?.chatName
            : getSenderName(currentUser, chat.users)}
        </p>
        <div className="latest-message">
          <p>
            {chat?.isGroupChat &&
              chat?.latestMessage &&
              chat?.latestMessage?.sender?.firstName + " - "}
            {chat?.latestMessage?.content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsCard;
