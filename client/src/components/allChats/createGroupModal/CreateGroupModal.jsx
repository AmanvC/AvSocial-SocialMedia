import React, { useContext, useState } from "react";
import "./createGroupModal.scss";
import { MdClose } from "react-icons/md";
import { toast } from "react-hot-toast";
import { makeRequest } from "../../../axios";
import SearchedUserCard from "../../searchedUserCard/SearchedUserCard";
import UserBadge from "./userBadge/UserBadge";
import { ChatContext } from "../../../context/chatContext";

const CreateGroupWrapper = ({ close, setAllChats }) => {
  const [groupName, setGroupName] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchedUserResults, setSearchedUserResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchUserLoading, setSearchUserLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groupNameError, setGroupNameError] = useState(false);

  const { setSelectedChat } = useContext(ChatContext);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (selectedUsers.length < 2) {
      toast.error("Select atleast 2 users to proceed!");
      return;
    }
    if (!groupName) {
      toast.error("Group name cannot be empty!");
      return;
    }
    try {
      setLoading(true);
      const res = await makeRequest().post("/chats/create-group-chat", {
        chatName: groupName,
        users: selectedUsers,
      });
      console.log(res);
      setSelectedChat(res?.data?.data);
      setAllChats((prev) => [res?.data?.data, ...prev]);
      setLoading(false);
      close();
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || "Something went wrong!");
    }
  };

  const handleSearchUser = async (e) => {
    try {
      if (searchInput.length < 1) {
        setSearchedUserResults([]);
        return;
      }
      setSearchUserLoading(true);
      const res = await makeRequest().get(
        `/profile/search/user?username=${searchInput}`
      );
      console.log(res);
      setSearchUserLoading(false);
      setSearchedUserResults(res?.data?.data);
    } catch (err) {
      setSearchUserLoading(false);
      toast.error(err.response?.data?.message || "Something went wrong!");
    }
  };

  const handleAddUserToGroup = (user) => {
    for (const u of selectedUsers) {
      if (u._id === user._id) {
        toast.error("User is already selected!");
        return;
      }
    }
    setSelectedUsers([...selectedUsers, user]);
    toast.success("User added to the group!");
  };

  const handleRemoveUser = (user) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    toast.success("User removed successfully.");
  };

  const handleGroupChatName = (e) => {
    if (e.target.value.length > 20) {
      setGroupNameError(true);
    } else {
      setGroupNameError(false);
    }
    setGroupName(e.target.value);
  };

  return (
    <div className="create-group-wrapper">
      <div className="create-group-container">
        <MdClose className="close" onClick={close} />
        <h1>Create Group Chat</h1>
        <form onSubmit={handleCreateGroup}>
          <div className="field">
            <label htmlFor="chatName">
              Enter Group Chat Name <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              id="chatName"
              value={groupName}
              onChange={handleGroupChatName}
              placeholder="Group Chat Name"
            />
            {groupNameError && (
              <small style={{ color: "red" }}>
                *Group name cannot contain more than 20 characters.
              </small>
            )}
          </div>
          <div className="field">
            <label htmlFor="users">
              Select Users <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              id="users"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyUp={handleSearchUser}
              placeholder="Select atleast 2 users"
            />
          </div>
          <div style={{ width: "100%" }}>
            {selectedUsers.length > 0 && (
              <div className="selected-users-badge">
                {selectedUsers.map((user) => (
                  <UserBadge
                    key={user._id}
                    user={user}
                    removeUser={() => handleRemoveUser(user)}
                  />
                ))}
              </div>
            )}
            {searchedUserResults.length > 0 && (
              <div className="searched-users-result">
                {searchedUserResults.slice(0, 3).map((user) => (
                  <SearchedUserCard
                    key={user._id}
                    user={user}
                    handleAddUserToGroup={() => handleAddUserToGroup(user)}
                    selectedUsers={selectedUsers}
                  />
                ))}
              </div>
            )}
          </div>
          <input
            type="submit"
            disabled={
              !groupName ||
              selectedUsers.length < 2 ||
              loading ||
              groupNameError
            }
            value={loading ? "Creating Group..." : "Create Group"}
          />
        </form>
      </div>
    </div>
  );
};

export default CreateGroupWrapper;
