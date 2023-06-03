import React from "react";
import "./chatInfoModal.scss";

const ChatInfoModal = ({ close }) => {
  return (
    <div onClick={close} className="chat-info-modal">
      ChatInfoModal
    </div>
  );
};

export default ChatInfoModal;
