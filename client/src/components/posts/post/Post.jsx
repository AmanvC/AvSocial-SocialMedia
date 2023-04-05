import "./post.scss";
import Image from "../../../assets/test.jpeg";

import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/authContext";
import { makeRequest } from "../../../axios";
import toast from "react-hot-toast";

import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { MdDeleteForever } from "react-icons/md";

const Post = ({ post, getAllPosts }) => {
  const [likes, setLikes] = useState([]);

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    getAllLikes();
  }, [post]);

  const getAllLikes = async () => {
    try {
      const res = await makeRequest().get(`/likes?postId=${post._id}`);
      setLikes(res.data.data);
    } catch (err) {
      toast.error("Something went wrong!");
    }
  };

  const handleLikeToggle = async () => {
    const liked = likes.indexOf(currentUser._id) !== -1;
    if (liked) {
      // const index = likes.indexOf(currentUser._id);
      // setLikes((prev) => prev.slice(index + 1));
      await makeRequest().delete(`/likes?postId=${post._id}`);
    } else {
      // setLikes((prev) => [...prev, currentUser._id]);
      await makeRequest().post("/likes", { postId: post._id });
    }
    await getAllLikes();
  };

  const deletePost = async () => {
    try {
      const res = await makeRequest().delete(`/posts?postId=${post._id}`);
      getAllPosts();
      toast.success(res?.data?.message || "Post deleted successfully.");
    } catch (err) {
      toast.error(err.response.data.message);
    }
  };

  return (
    <div className="post">
      <div className="post-details">
        <div className="user">
          <img src={Image} alt="image" />
          <div className="details">
            <p className="name">
              {post.user.firstName + " " + post.user.lastName}
            </p>
            <p className="time">{moment(post.createdAt).fromNow()}</p>
          </div>
        </div>
        {currentUser._id === post.user._id && (
          <MdDeleteForever className="delete-icon" onClick={deletePost} />
        )}
      </div>
      <div className="post-content">
        {post.content && (
          <div className="post-text">
            <p>{post.content}</p>
          </div>
        )}
        {post.image && (
          <div className="post-image">
            <img src={"/uploads/" + post.image} alt={post.image} />
          </div>
        )}
      </div>
      <div className="actions-container">
        <div className="like-icon" onClick={handleLikeToggle}>
          {likes.indexOf(currentUser._id) !== -1 ? (
            <AiFillHeart style={{ color: "red" }} />
          ) : (
            <AiOutlineHeart />
          )}
        </div>
        <div className="count">{likes.length} likes</div>
      </div>
    </div>
  );
};

export default Post;
