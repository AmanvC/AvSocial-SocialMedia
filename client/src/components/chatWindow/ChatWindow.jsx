import React, { useContext, useEffect, useRef, useState } from "react";
import "./chatWindow.scss";
import { ChatContext } from "../../context/chatContext";
import { getSenderName, isSameSender } from "../../utils/chatLogic";
import { AuthContext } from "../../context/authContext";
import { CgMoreR } from "react-icons/cg";
import ChatInfoModal from "./chatInfoModal/ChatInfoModal";
import { toast } from "react-hot-toast";
import { makeRequest } from "../../axios";
import Spinner from "../spinner/Spinner";
import Img from "../lazyLoadImage/Img";
import NoUserImage from "../../assets/NoUserImage.png";
// import {
//   PRODUCTION,
//   SOCKET_LOCAL,
//   SOCKET_PRODUCTION,
// } from "../../utils/constants";
// import io from "socket.io-client";

// const ENDPOINT = PRODUCTION ? SOCKET_PRODUCTION : SOCKET_LOCAL;
let selectedChatCompare;

const ChatWindow = () => {
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  // const [socketConnected, setSocketConnected] = useState(false);

  const { selectedChat, setAllChats, allChats } = useContext(ChatContext);
  const { currentUser, socket } = useContext(AuthContext);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [selectedChat, allMessages]);

  useEffect(() => {
    if (selectedChat) {
      getAllMessages();
      selectedChatCompare = selectedChat;
    }
  }, [selectedChat]);

  // useEffect(() => {
  //   socket = io(ENDPOINT);
  //   socket.emit("setup", currentUser);
  //   socket.on("connected", () => setSocketConnected(true));
  // }, []);

  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        // give notification
      } else {
        setAllMessages([...allMessages, newMessageReceived]);
      }
    });
  });

  const getAllMessages = async () => {
    try {
      setChatLoading(true);
      const res = await makeRequest().get(`/messages/${selectedChat._id}`);
      setAllMessages(res?.data?.data);
      setChatLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (err) {
      setChatLoading(false);
      console.log(err);
      toast.error(err.response?.error?.message || "Something went wrong!");
    }
  };

  const handleInputChange = async (e) => {
    if (e.key === "Enter" && searchInput.length === 0) {
      return;
    }
    if (e.key === "Enter") {
      try {
        const res = await makeRequest().post("/messages/create", {
          content: searchInput,
          chatId: selectedChat._id,
        });
        if (res.data.success) {
          setAllMessages([...allMessages, res.data?.data]);
          setSearchInput("");
          const remChats = allChats.filter(
            (chat) => chat._id !== selectedChat._id
          );
          setAllChats([res.data?.data?.chat, ...remChats]);
          socket.emit("new message", res.data.data);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <div className="chat-window">
      {!selectedChat ? (
        <h1>Select a chat to continue!</h1>
      ) : (
        <div className="chat-screen">
          <div className="heading">
            <h2>
              {selectedChat.isGroupChat
                ? selectedChat.chatName.charAt(0).toUpperCase() +
                  selectedChat.chatName.slice(1)
                : getSenderName(currentUser, selectedChat.users)}
            </h2>
            <CgMoreR className="info" onClick={() => setShowChatInfo(true)} />
          </div>
          <div className="content">
            <div className="messages">
              <p
                style={{
                  opacity: 0.3,
                  textAlign: "center",
                  marginBottom: 10,
                  userSelect: "none",
                }}
              >
                This is the beginning of the chat.
              </p>
              {allMessages?.map((message, index) => (
                <div
                  style={{ display: "flex", flexDirection: "column" }}
                  key={message._id}
                >
                  {selectedChat.isGroupChat ? (
                    <>
                      {message.sender._id !== currentUser._id &&
                        !isSameSender(allMessages, index) && (
                          <div>
                            <div className="sender-info">
                              <Img
                                src={message.sender.profileImage || NoUserImage}
                              />
                              {message.sender.firstName +
                                " " +
                                message.sender.lastName}
                            </div>
                          </div>
                        )}
                      <p
                        className={`message ${
                          message.sender._id === currentUser._id
                            ? "current-sender"
                            : "other-sender"
                        }`}
                      >
                        {message.content}
                      </p>
                    </>
                  ) : (
                    <p
                      className={`message ${
                        message.sender._id === currentUser._id
                          ? "current-sender"
                          : "other-sender"
                      }`}
                    >
                      {message.content}
                    </p>
                  )}

                  <div ref={bottomRef} />
                </div>
              ))}
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.trimStart())}
              onKeyDown={handleInputChange}
              placeholder="type here..."
            />
            {chatLoading && <Spinner />}
          </div>
          {showChatInfo && (
            <ChatInfoModal close={() => setShowChatInfo(false)} />
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
