import "./posts.scss";

import Post from "./post/Post";
import { useContext } from "react";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import Share from "../share/Share";
import toast from "react-hot-toast";
import Loader from "../loader/Loader";
import { useQuery } from "@tanstack/react-query";

const Posts = () => {
  const { logout } = useContext(AuthContext);

  const {
    isLoading,
    data: posts,
    error,
  } = useQuery({
    queryKey: ["posts"],
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

  return (
    <div className="posts">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <Share />
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
