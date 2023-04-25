import PendingRequests from "../pendingRequests/PendingRequests";
import "./rightBar.scss";

const RightBar = () => {
  return (
    <div className="rightbar">
      <PendingRequests />
      <div className="divider"></div>
      <div className="message-container">
        <p>Chat</p> <p>Coming Soon...</p>
      </div>
    </div>
  );
};

export default RightBar;
