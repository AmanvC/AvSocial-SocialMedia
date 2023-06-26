import "./onlineFriends.scss";
import { AuthContext } from "../../context/authContext";
import { useCallback, useContext, useEffect, useState } from "react";
import NoUserImage from "../../assets/NoUserImage.png";
import Img from "../lazyLoadImage/Img";
import { Link } from "react-router-dom";
import { ChatContext } from "../../context/chatContext";
import { makeRequest } from "../../axios";

const OnlineFriends = () => {
  const [onlineFriends, setOnlineFriends] = useState([]);
  const { socket, currentUser } = useContext(AuthContext);
  const { setSelectedChat } = useContext(ChatContext);

  useEffect(() => {
    socket.emit("online friends", currentUser);
    socket.on("online friends list", (friends) => {
      setOnlineFriends(friends);
    });
  });
  //   }, [socket, currentUser]);

  const selectChat = useCallback(async (user) => {
    const res = await makeRequest().post("/chats/create-or-get", {
      userId: user._id,
    });
    setSelectedChat(res?.data?.data);
  }, []);

  return (
    <div className="online-friends">
      <h3>Online Friends</h3>
      <div className="online">
        {onlineFriends.length === 0 ? (
          <p>All Friends are offline :(</p>
        ) : (
          onlineFriends.map((friend) => (
            <Link
              onClick={() => selectChat(friend)}
              to={`/chats`}
              key={friend._id}
            >
              <div className="friend-card">
                <div className="image">
                  <div className="online-icon"></div>
                  <Img
                    src={
                      friend.profileImage ? friend.profileImage : NoUserImage
                    }
                  />
                </div>
                <p>{friend.firstName + " " + friend.lastName}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default OnlineFriends;
