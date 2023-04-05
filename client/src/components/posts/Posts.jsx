import "./posts.scss";

import Post from "./post/Post";
import { useContext, useEffect, useState } from "react";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import Share from "../share/Share";
import toast from "react-hot-toast";
import Loader from "../loader/Loader";

const Posts = () => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState(null);

  const { logout } = useContext(AuthContext);

  useEffect(() => {
    getAllPosts();
  }, []);

  const getAllPosts = async () => {
    try {
      const posts = await makeRequest().get("/posts");
      setPosts(posts.data.data);
      setLoading(false);
    } catch (err) {
      if (err.response.data === "Unauthorized") {
        logout();
        toast.error("You have been logged out, please login to continue");
        return;
      }
      toast.error("Something went Wrong!");
      setLoading(false);
    }
  };

  return (
    <div className="posts">
      {loading ? (
        <Loader />
      ) : (
        <>
          <Share fetchPosts={getAllPosts} />
          {posts?.map((post, index) => (
            <Post key={index} post={post} getAllPosts={getAllPosts} />
          ))}
          {posts.length === 0 && (
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
