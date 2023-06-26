import React, { useContext } from "react";
import "./chatInfoModal.scss";
import { ChatContext } from "../../../context/chatContext";
import PersonalChatProfile from "./personalChatProfile/PersonalChatProfile";
import GroupChatProfile from "./groupChatProfile/GroupChatProfile";
import { MdClose } from "react-icons/md";
import { getSenderDetails } from "../../../utils/chatLogic";
import { AuthContext } from "../../../context/authContext";

const ChatInfoModal = ({ close }) => {
  const { selectedChat } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="chat-info-modal">
      <div className="chat-info-container">
        <MdClose className="close" onClick={close} />
        {selectedChat.chatName === "sender" ? (
          <PersonalChatProfile
            user={getSenderDetails(currentUser, selectedChat.users)}
          />
        ) : (
          <GroupChatProfile currentUser={currentUser} chat={selectedChat} />
        )}
      </div>
    </div>
  );
};

export default ChatInfoModal;
