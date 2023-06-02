import React from "react";
import "./userBadge.scss";
import { MdClose } from "react-icons/md";

const UserBadge = ({ user, removeUser }) => {
  return (
    <div className="user-badge">
      <p>{user.firstName + " " + user.lastName}</p>
      <MdClose
        onClick={removeUser}
        style={{ cursor: "pointer", fontSize: "1.2em" }}
      />
    </div>
  );
};

export default UserBadge;
