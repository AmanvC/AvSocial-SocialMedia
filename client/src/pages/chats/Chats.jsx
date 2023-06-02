import React from "react";
import "./chats.scss";
import Header from "../../components/header/Header";
import ContentWrapper from "../../components/contentWrapper/ContentWrapper";
import AllChats from "../../components/allChats/AllChats";
import ChatWindow from "../../components/chatWindow/ChatWindow";

const Chats = () => {
  return (
    <div className="content">
      <Header />
      <ContentWrapper>
        <div className="chats">
          <AllChats />
          <ChatWindow />
        </div>
      </ContentWrapper>
    </div>
  );
};

export default Chats;
