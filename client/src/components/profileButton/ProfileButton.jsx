import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { GoCheck } from "react-icons/go";
import { AiFillCaretDown } from "react-icons/ai";
import { HiUserRemove } from "react-icons/hi";

import "./profileButton.scss";
import { makeRequest } from "../../axios";

const ProfileButton = ({ userProfile, currentUser, updateProfile, userId }) => {
  const [relationship, setRelationship] = useState({});
  const [loading, setLoading] = useState(true);
  const [showRemoveFriend, setShowRemoveFriend] = useState(false);

  useEffect(() => {
    getUserRelationship();
  }, []);

  console.log(relationship);

  const getUserRelationship = async () => {
    try {
      setLoading(true);
      const res = await makeRequest().get(`/relationship/status/${userId}`);
      setLoading(false);
      console.log(res);
      if (res.data?.success) {
        setRelationship(res.data.data);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
      toast.error(err.response.data.message || "Something went wrong!");
    }
  };

  const handleAddFriend = async () => {
    try {
      setLoading(true);
      const res = await makeRequest().post("/relationship/create", {
        user_id: userId,
      });
      setLoading(false);
      toast.success(res.data.message);
      getUserRelationship();
    } catch (err) {
      setLoading(false);
      console.log(err);
      toast.error(err.response.data.message || "Something went wrong!");
    }
  };

  const handleAcceptRequest = async () => {
    try {
      setLoading(true);
      const res = await makeRequest().post("/relationship/accept", {
        user_id: userId,
      });
      setLoading(false);
      toast.success(res.data.message);
      getUserRelationship();
    } catch (err) {
      setLoading(false);
      console.log(err);
      toast.error(err.response.data.message || "Something went wrong!");
    }
  };

  const handleDeleteRequest = async (toastMessage) => {
    try {
      setLoading(true);
      const res = await makeRequest().delete("/relationship/delete", {
        data: {
          user_id: userId,
        },
      });
      setLoading(false);
      toast.success(toastMessage);
      getUserRelationship();
    } catch (err) {
      setLoading(false);
      console.log(err);
      toast.error(err.response.data.message || "Something went wrong!");
    }
  };

  const OutsideClick = (ref, state) => {
    useEffect(() => {
      const handleOutsideClick = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
          state(false);
        }
      };
      // add the event listener
      document.addEventListener("mousedown", handleOutsideClick);
    }, [ref]);
  };

  const removeFriendRef = useRef(null);
  OutsideClick(removeFriendRef, setShowRemoveFriend);

  return (
    <>
      {loading ? (
        <button
          style={{ transform: "scale(1)", opacity: 0.6, cursor: "not-allowed" }}
        >
          loading...
        </button>
      ) : (
        <div className="profile-button">
          {userProfile._id === currentUser._id ? (
            <button onClick={updateProfile}>Update Profile</button>
          ) : !relationship ? (
            <button onClick={handleAddFriend}>Add Friend</button>
          ) : relationship.status === "Accepted" ? (
            <button
              onClick={() => setShowRemoveFriend(true)}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <GoCheck /> Friend <AiFillCaretDown />
            </button>
          ) : relationship.sentBy === currentUser._id ? (
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ cursor: "not-allowed", transform: "scale(1)" }}>
                Pending
              </button>
              <button
                style={{ backgroundColor: "gray" }}
                onClick={() =>
                  handleDeleteRequest("Request deleted successfully.")
                }
              >
                Cancel
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleAcceptRequest}>Accept Request</button>
              <button
                style={{ backgroundColor: "gray" }}
                onClick={() =>
                  handleDeleteRequest("Request deleted successfully.")
                }
              >
                Delete
              </button>
            </div>
          )}
          {showRemoveFriend && (
            <div
              onClick={() => {
                handleDeleteRequest("User friendship removed.");
                setShowRemoveFriend(false);
              }}
              ref={removeFriendRef}
              className="friend-options"
            >
              <p>
                <HiUserRemove /> Unfriend
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ProfileButton;
