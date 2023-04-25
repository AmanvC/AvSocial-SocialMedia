import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { GoCheck } from "react-icons/go";
import { AiFillCaretDown } from "react-icons/ai";
import { HiUserRemove } from "react-icons/hi";
import { useQueryClient, useMutation } from "@tanstack/react-query";

import "./profileButton.scss";
import { makeRequest } from "../../axios";

const ProfileButton = ({
  userProfile,
  currentUser,
  updateProfile,
  userId,
  relationship,
}) => {
  const [showRemoveFriend, setShowRemoveFriend] = useState(false);

  const queryClient = useQueryClient();

  const acceptRequestMutation = useMutation({
    mutationFn: () => {
      return makeRequest().post("/relationship/accept", {
        user_id: userId,
      });
    },
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries(
        ["userRelationship", currentUser._id, userId],
        {
          exact: true,
        }
      );
      queryClient.invalidateQueries(["pendingRequests", currentUser._id], {
        exact: true,
      });
      queryClient.invalidateQueries(["posts", userId], { exact: true });
    },
    onError: (res) => {
      toast.error(res.response.data.message || "Something went wrong!");
    },
  });

  const addFriendMutation = useMutation({
    mutationFn: () => {
      return makeRequest().post("/relationship/create", {
        user_id: userId,
      });
    },
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries(
        ["userRelationship", currentUser._id, userId],
        {
          exact: true,
        }
      );
      queryClient.invalidateQueries(["pendingRequests", currentUser._id], {
        exact: true,
      });
    },
    onError: (res) => {
      toast.error(res.response.data.message || "Something went wrong!");
    },
  });

  const deleteRequestMutation = useMutation({
    mutationFn: () => {
      return makeRequest().delete("/relationship/delete", {
        data: {
          user_id: userId,
        },
      });
    },
    onSuccess: (res, variables) => {
      toast.success(variables);
      queryClient.invalidateQueries(
        ["userRelationship", currentUser._id, userId],
        {
          exact: true,
        }
      );
      queryClient.invalidateQueries(["pendingRequests", currentUser._id], {
        exact: true,
      });
      queryClient.invalidateQueries(["posts", userId], { exact: true });
    },
    onError: (res) => {
      toast.error(res.response.data.message || "Something went wrong!");
    },
  });

  const handleAddFriend = () => {
    addFriendMutation.mutate();
  };

  const handleAcceptRequest = () => {
    acceptRequestMutation.mutate();
  };

  const handleDeleteRequest = async (toastMessage) => {
    deleteRequestMutation.mutate(toastMessage);
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
    <div className="profile-button">
      {userProfile._id === currentUser._id ? (
        <button onClick={updateProfile}>Update Profile</button>
      ) : !relationship ? (
        addFriendMutation.isLoading ? (
          <button
            style={{
              opacity: 0.5,
              cursor: "not-allowed",
              transform: "scale(1)",
            }}
          >
            loading...
          </button>
        ) : (
          <button onClick={handleAddFriend}>Add Friend</button>
        )
      ) : relationship.status === "Accepted" ? (
        deleteRequestMutation.isLoading ? (
          <button
            style={{
              opacity: 0.5,
              cursor: "not-allowed",
              transform: "scale(1)",
            }}
          >
            loading...
          </button>
        ) : (
          <button
            onClick={() => setShowRemoveFriend(true)}
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <GoCheck /> Friend <AiFillCaretDown />
          </button>
        )
      ) : relationship.sentBy === currentUser._id ? (
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ cursor: "not-allowed", transform: "scale(1)" }}>
            Pending
          </button>
          {deleteRequestMutation.isLoading ? (
            <button
              style={{
                opacity: 0.5,
                cursor: "not-allowed",
                transform: "scale(1)",
                backgroundColor: "gray",
              }}
            >
              loading...
            </button>
          ) : (
            <button
              style={{ backgroundColor: "gray" }}
              onClick={() =>
                handleDeleteRequest("Request deleted successfully.")
              }
            >
              Cancel
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleAcceptRequest}>Accept Request</button>
          <button
            style={{ backgroundColor: "gray" }}
            onClick={() => handleDeleteRequest("Request deleted successfully.")}
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
  );
};

export default ProfileButton;
