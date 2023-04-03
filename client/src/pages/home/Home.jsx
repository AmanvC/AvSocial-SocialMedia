import "./home.scss";

import Stories from "../../components/stories/Stories";
import Posts from "../../components/posts/Posts";
import Loader from "../../components/loader/Loader";
import { useContext, useState } from "react";
import { useEffect } from "react";
import { makeRequest } from "../../axios";
import { useToasts } from "react-toast-notifications";
import { AuthContext } from "../../context/authContext";
import Share from "../../components/share/Share";

const Home = () => {
  // API calls hooks
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState(null);
  const [stories, setStories] = useState(null);

  const { logout } = useContext(AuthContext);

  const { addToast } = useToasts();

  useEffect(() => {
    const posts = makeRequest().get("/posts");
    const stories = makeRequest().get("/stories");

    Promise.all([posts, stories])
      .then((res) => {
        setPosts(res[0].data.data);
        setStories(res[1].data.data);
        setLoading(false);
      })
      .catch((err) => {
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
        setError("Something went Wrong!");
        setLoading(false);
        // console.log(err.response.message);
      });
  }, []);

  const fetchPosts = async () => {
    const res = await makeRequest().get("/posts");
    setPosts(res.data.data);
  };

  console.log(posts);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="home">
      {!error ? (
        <>
          <Stories />
          <Share fetchPosts={fetchPosts} />
          <Posts posts={posts} />
        </>
      ) : (
        "Something went wrong!"
      )}
    </div>
  );
};

export default Home;
