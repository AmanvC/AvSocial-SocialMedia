import "./groupChatProfile.scss";
import { isGroupAdmin } from "../../../../utils/chatLogic";
import NoGroupPicture from "../../../../assets/group.png";
import Img from "../../../lazyLoadImage/Img";
import { Link } from "react-router-dom";
import { MdClose } from "react-icons/md";

const GroupChatProfile = ({ currentUser, chat }) => {
  console.log(isGroupAdmin(currentUser, chat.groupAdmins));

  const chatNameArray = () => {
    return chat.chatName.split(" ");
  };

  const removeUser = (userId) => {
    console.log(userId);
  };

  return (
    <div className="group-chat-profile">
      <h1>
        {chatNameArray().length === 1 ? (
          <span>{chat.chatName}</span>
        ) : (
          <>
            <span>
              {chatNameArray()
                .slice(0, chatNameArray().length - 1)
                .join(" ")}
            </span>
            <span style={{ color: "var(--theme-color)" }}>
              {" " + chatNameArray().slice(-1)}
            </span>
          </>
        )}
      </h1>
      <div className="image">
        <Img src={chat.picture || NoGroupPicture} />
      </div>
      <div className="all-users-container">
        <p>Group Members</p>
        <div className="all-users">
          {chat.users.map((user) => (
            <p key={user._id}>
              <span>
                <Link to={`/profile/${user._id}`}>
                  {user.firstName + " " + user.lastName.charAt(0)}
                </Link>
              </span>
              {/* Todo: Remove user from group, add user, make admin. */}
              {/* {isGroupAdmin(currentUser, chat.groupAdmins) && (
                <MdClose
                  onClick={() => removeUser(user._id)}
                  style={{ cursor: "pointer", fontSize: "1.2em" }}
                />
              )} */}
            </p>
          ))}
        </div>
      </div>
      {/* SEARCH USERS TO ADD, use SEARCHUSERCARD component */}
    </div>
  );
};

export default GroupChatProfile;
