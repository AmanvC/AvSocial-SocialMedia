import React, { useContext, useEffect, useRef, useState } from "react";
import "./allChats.scss";
import toast from "react-hot-toast";
import { FiMoreHorizontal } from "react-icons/fi";
import { makeRequest } from "../../axios";
import { ChatContext } from "../../context/chatContext";
import { AuthContext } from "../../context/authContext";
import UserDetailsCard from "../userDetailsCard/UserDetailsCard";
import Img from "../lazyLoadImage/Img";
import NoUserImage from "../../assets/NoUserImage.png";
import CreateGroupWrapper from "./createGroupWrapper/CreateGroupWrapper";
import { RxMagnifyingGlass } from "react-icons/rx";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import SearchUserModal from "./searchUserModal/SearchUserModal";

const AllChats = () => {
  const [chatsLoading, setChatsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showSearchUser, setShowSearchUser] = useState(false);

  const { selectedChat, allChats, setAllChats } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    getAllChats();
  }, []);

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
    <div className="all-chats">
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
        <CreateGroupWrapper
          close={() => setShowCreateGroup(false)}
          getAllChats={getAllChats}
        />
      )}
      {showSearchUser && (
        <SearchUserModal
          close={() => setShowSearchUser(false)}
          getAllChats={getAllChats}
        />
      )}
    </div>
  );
};

export default AllChats;
