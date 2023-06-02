import React from "react";
import "./searchedUserCard.scss";
import Img from "../lazyLoadImage/Img";
import NoUserImage from "../../assets/NoUserImage.png";

const SearchedUserCard = ({ user, handleAddUserToGroup, selectedUsers }) => {
  const isUserAdded = () => {
    for (const u of selectedUsers) {
      if (u._id === user._id) {
        return true;
      }
    }
    return false;
  };

  return (
    <div
      onClick={handleAddUserToGroup}
      className={`searched-user-card ${isUserAdded() && "selected-user"}`}
    >
      <div className="image">
        <Img src={user.profileImage || NoUserImage} />
      </div>
      <div className="user-details">
        <p className="name">{user.firstName + " " + user.lastName}</p>
        <small>{user.email}</small>
      </div>
    </div>
  );
};

export default SearchedUserCard;
