import "./home.scss";

import Stories from "../../components/stories/Stories";
import Posts from "../../components/posts/Posts";
import Loader from "../../components/loader/Loader";
import { useState } from "react";
import { useEffect } from "react";
import { makeRequest } from "../../axios";
import { useToasts } from "react-toast-notifications";

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([{ posts: null }, { stories: null }]);

  const { addToast } = useToasts();

  useEffect(() => {
    const posts = makeRequest().get("/posts");
    const stories = makeRequest().get("/stories");

    //todo
    setLoading(true);
    Promise.all([posts, stories])
      .then((res) => {
        // console.log(res);
        setData([
          {
            posts: res[0].data.posts,
          },
          {
            stories: res[1].data.stories,
          },
        ]);
      })
      .catch((err) => {
        addToast("Something went Wrong!", {
          appearance: "error",
          autoDismiss: true,
        });
        setError("Something went Wrong!");
        // console.log(err.response.message);
      });
    setLoading(false);
  }, []);

  console.log(data);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="home">
      {!error ? (
        <>
          <Stories />
          <Posts />
        </>
      ) : (
        "Something went wrong!"
      )}
    </div>
  );
};

export default Home;
