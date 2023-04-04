import "./post.scss";
import Image from "../../../assets/test.jpeg";

import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/authContext";
import { makeRequest } from "../../../axios";
import toast from "react-hot-toast";

import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

const Post = ({ post }) => {
  const [likes, setLikes] = useState([]);

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    getAllLikes();
  }, []);

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
      const index = likes.indexOf(currentUser._id);
      setLikes((prev) => prev.slice(index + 1));
      await makeRequest().delete(`/likes?postId=${post._id}`);
    } else {
      setLikes((prev) => [...prev, currentUser._id]);
      await makeRequest().post("/likes", { postId: post._id });
    }
    getAllLikes();
  };

  return (
    <div className="post">
      <div className="post-details">
        <img src={Image} alt="image" />
        <div className="details">
          <p className="name">
            {post.user.firstName + " " + post.user.lastName}
          </p>
          <p className="time">{moment(post.createdAt).fromNow()}</p>
        </div>
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
        <div className="count">{likes.length} Likes</div>
      </div>
    </div>
  );
};

export default Post;
