import "./posts.scss";

import Post from "./post/Post";
import { useContext, useEffect, useState } from "react";
import { makeRequest } from "../../axios";
import { useToasts } from "react-toast-notifications";
import { AuthContext } from "../../context/authContext";
import Share from "../share/Share";
import Loader from "../loader/Loader";

const Posts = () => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState(null);

  const { addToast } = useToasts();
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
        addToast("You have been logged out, please login to continue", {
          appearance: "error",
          autoDismiss: true,
        });
        return;
      }
      addToast("Something went Wrong!", {
        appearance: "error",
        autoDismiss: true,
      });
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
            <Post key={index} post={post} />
          ))}
        </>
      )}
    </div>
  );
};

export default Posts;
