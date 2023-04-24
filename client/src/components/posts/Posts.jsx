import "./posts.scss";

import Post from "./post/Post";
import { useContext, useState } from "react";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import Share from "./share/Share";
import toast from "react-hot-toast";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

const Posts = () => {
  const { logout } = useContext(AuthContext);
  const [timestamp, setTimestamp] = useState(null);

  const queryClient = useQueryClient();

  const { currentUser } = useContext(AuthContext);

  const {
    data: posts,
    error,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    remove,
  } = useInfiniteQuery({
    queryKey: ["posts", "infinite", currentUser._id],
    getNextPageParam: (prevData) =>
      prevData.nextPage ? prevData.nextPage : undefined,
    refetchOnWindowFocus: false,
    queryFn: async ({ pageParam = 1 }) => {
      if (timestamp) {
        const res = await makeRequest().get(
          `/posts?page=${pageParam}&timestamp=${timestamp}`
        );
        setTimestamp(res.data.timestamp);
        return res.data;
      }
      const res = await makeRequest().get(`/posts?page=${pageParam}`);
      setTimestamp(res.data.timestamp);
      return res.data;
    },
  });

  const updatePostsList = () => {
    setTimestamp(null);
    remove();
    toast.success("Post Created Successfully.");
  };

  if (error) {
    if (error?.response?.data === "Unauthorized") {
      logout();
      toast.error("You have been logged out, please login to continue");
      return;
    }
    toast.error("Something went Wrong!");
  }

  const handleRetryFetchingPosts = () => {
    queryClient.invalidateQueries(["posts", "infinite", currentUser._id], {
      exact: true,
    });
  };

  return (
    <div className="posts">
      <Share setTimestamp={setTimestamp} updatePostsList={updatePostsList} />
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
          {posts?.pages
            ?.flatMap((data) => data.data)
            .map((post) => (
              <Post key={post._id} post={post} />
            ))}
          {posts?.pages.length === 0 && (
            <div className="no-posts-available">
              <p>Uh huh, it seems you and your friends haven't posted yet!</p>
            </div>
          )}
        </>
      )}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          Fetch more
        </button>
      )}
    </div>
  );
};

export default Posts;
