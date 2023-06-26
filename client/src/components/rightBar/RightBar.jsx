import OnlineFriends from "../onlineFriends/OnlineFriends";
import PendingRequests from "../pendingRequests/PendingRequests";
import "./rightBar.scss";

const RightBar = () => {
  return (
    <div className="rightbar">
      <PendingRequests />
      <OnlineFriends />
    </div>
  );
};

export default RightBar;
