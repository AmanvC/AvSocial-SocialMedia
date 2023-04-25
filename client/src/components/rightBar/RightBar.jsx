import "./rightBar.scss";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";

import { makeRequest } from "../../axios";
import NoUserImage from "../../assets/NoUserImage.png";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";

const RightBar = () => {
  const { currentUser } = useContext(AuthContext);

  const {
    isLoading: pendingRequestsLoading,
    error: pendingRequestsError,
    data: requests,
  } = useQuery({
    queryKey: ["pendingRequests", currentUser._id],
    refetchInterval: 3000,
    queryFn: async () => {
      const res = await makeRequest().get("/relationship/pending");
      return res.data.data;
    },
  });

  if (pendingRequestsError) {
    toast.error("Could not fetch pending requests, something went Wrong!");
  }

  const queryClient = useQueryClient();

  const requestsMutation = useMutation(
    ([action, userId]) => {
      console.log(action);
      if (action === "delete") {
        return makeRequest().delete("/relationship/delete", {
          data: { user_id: userId },
        });
      }
      return makeRequest().post("/relationship/accept", { user_id: userId });
    },
    {
      onSuccess: (res, variables) => {
        console.log(variables);
        toast.success(res.data.message);
        queryClient.invalidateQueries(["pendingRequests"]);
        queryClient.invalidateQueries(
          ["userRelationship", currentUser._id, variables[1]],
          {
            exact: true,
          }
        );
        queryClient.refetchQueries(["posts", variables[1]]);
        queryClient.refetchQueries(["posts", currentUser._id]);
      },
    }
  );

  const handleRetryFetchingPendingRequests = () => {
    queryClient.invalidateQueries(["pendingRequests", currentUser._id]);
  };

  return (
    <div className="rightbar">
      <div className="pending-requests-container">
        <h3>Pending Requests</h3>
        <div className="pending-requests">
          {pendingRequestsLoading ? (
            <div className="loading-wrapper">
              <div className="loading"></div>
            </div>
          ) : pendingRequestsError ? (
            <div className="error-container">
              <p onClick={handleRetryFetchingPendingRequests}>Retry?</p>
            </div>
          ) : requests?.length === 0 ? (
            <p style={{ textAlign: "center" }}>No pending requests.</p>
          ) : (
            requests?.map((request) => (
              <div className="element" key={request._id}>
                <div className="user-info">
                  <img
                    src={
                      request?.sentBy?.profileImage
                        ? `/uploads/${request?.sentBy?.profileImage}`
                        : NoUserImage
                    }
                    className="user-image"
                  />
                  <div className="info">
                    <Link
                      className="profile-link"
                      to={`/profile/${request.sentBy._id}`}
                    >
                      {request.sentBy.firstName + " " + request.sentBy.lastName}
                    </Link>
                  </div>
                </div>

                <div className="buttons">
                  <button
                    disabled={requestsMutation.isLoading}
                    onClick={() =>
                      requestsMutation.mutate(["accept", request.sentBy._id])
                    }
                  >
                    Accept
                  </button>
                  <button
                    disabled={requestsMutation.isLoading}
                    onClick={() =>
                      requestsMutation.mutate(["delete", request.sentBy._id])
                    }
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="divider"></div>
      <div className="message-container">
        <p>Chat</p> <p>Coming Soon...</p>
      </div>
    </div>
  );
};

export default RightBar;
