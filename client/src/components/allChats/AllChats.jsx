import React, { useContext, useEffect, useState } from "react";
import "./allChats.scss";
import toast from "react-hot-toast";
import { makeRequest } from "../../axios";
import { ChatContext } from "../../context/chatContext";
import UserDetailsCard from "../userDetailsCard/UserDetailsCard";
import CreateGroupModal from "./createGroupModal/CreateGroupModal";
import { RxMagnifyingGlass } from "react-icons/rx";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import SearchUserModal from "./searchUserModal/SearchUserModal";
// import io from "socket.io-client";
// import {
//   PRODUCTION,
//   SOCKET_LOCAL,
//   SOCKET_PRODUCTION,
// } from "../../utils/constants";
import { AuthContext } from "../../context/authContext";

// const ENDPOINT = PRODUCTION ? SOCKET_PRODUCTION : SOCKET_LOCAL;
// let socket;

const AllChats = () => {
  const [chatsLoading, setChatsLoading] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showSearchUser, setShowSearchUser] = useState(false);

  const { allChats, setAllChats, selectedChat } = useContext(ChatContext);
  const { currentUser, socket } = useContext(AuthContext);

  useEffect(() => {
    getAllChats();
  }, []);

  // useEffect(() => {
  //   socket = io(ENDPOINT);
  //   socket.emit("setup", currentUser);
  // }, []);

  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      const remChats = allChats.filter(
        (chat) => chat._id !== newMessageReceived.chat._id
      );
      setAllChats([newMessageReceived.chat, ...remChats]);
    });
  });

  const getAllChats = async () => {
    try {
      setChatsLoading(true);
      const res = await makeRequest().get("/chats");
      setChatsLoading(false);
      setAllChats(res?.data?.data);
    } catch (err) {
      setChatsLoading(false);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className={selectedChat ? "all-chats hidden" : "all-chats"}>
      <div className="heading">
        <h2>All Chats</h2>
        <div className="options">
          <button onClick={() => setShowSearchUser(true)}>
            <RxMagnifyingGlass />
          </button>
          <button onClick={() => setShowCreateGroup(true)}>
            <AiOutlineUsergroupAdd />
          </button>
        </div>
      </div>
      <div className="users">
        {allChats?.map((chat) => (
          <UserDetailsCard key={chat._id} chat={chat} />
        ))}
      </div>
      {showCreateGroup && (
        <CreateGroupModal
          close={() => setShowCreateGroup(false)}
          setAllChats={setAllChats}
        />
      )}
      {showSearchUser && (
        <SearchUserModal
          close={() => setShowSearchUser(false)}
          allChats={allChats}
          setAllChats={setAllChats}
        />
      )}
    </div>
  );
};

export default AllChats;
