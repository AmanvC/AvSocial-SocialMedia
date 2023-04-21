import "./posts.scss";

import Post from "./post/Post";
import { useContext } from "react";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import Share from "../share/Share";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const Posts = () => {
  const { logout } = useContext(AuthContext);

  const queryClient = useQueryClient();

  const { currentUser } = useContext(AuthContext);

  const {
    isLoading,
    data: posts,
    error,
  } = useQuery({
    queryKey: ["posts for", currentUser._id],
    queryFn: async () => {
      const res = await makeRequest().get("/posts");
      return res.data.data;
    },
  });

  if (error) {
    if (error?.response?.data === "Unauthorized") {
      logout();
      toast.error("You have been logged out, please login to continue");
      return;
    }
    toast.error("Something went Wrong!");
  }

  const handleRetryFetchingPosts = () => {
    queryClient.invalidateQueries(["posts for", currentUser._id], {
      exact: true,
    });
  };

  return (
    <div className="posts">
      <Share />
      {isLoading ? (
        <div className="loading-wrapper">
          <div className="loading"></div>
        </div>
      ) : error ? (
        <div className="retry-container">
          <p>Click </p>
          <p className="retry" onClick={handleRetryFetchingPosts}>
            here
          </p>
          <p>to retry.</p>
        </div>
      ) : (
        <>
          {posts?.map((post) => (
            <Post key={post._id} post={post} />
          ))}
          {posts?.length === 0 && (
            <div className="no-posts-available">
              <p>Uh huh, it seems you and your friends haven't posted yet!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Posts;
