import Img from "../../../lazyLoadImage/Img";
import "./personalChatProfile.scss";
import NoUserImage from "../../../../assets/NoUserImage.png";
import { Link } from "react-router-dom";

const PersonalChatProfile = ({ user }) => {
  console.log(user);
  return (
    <div className="personal-chat-profile">
      <Link to={`/profile/${user._id}`}>
        <h1>
          <span>{user.firstName}</span>
          <span style={{ color: "var(--theme-color)" }}>
            {" " + user.lastName}
          </span>
        </h1>
      </Link>
      <div className="image">
        <Img src={user.profileImage || NoUserImage} />
      </div>
      <p>{user.email}</p>
    </div>
  );
};

export default PersonalChatProfile;
