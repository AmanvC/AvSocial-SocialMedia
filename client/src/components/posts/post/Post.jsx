import "./post.scss";
import Image from "../../../assets/test.jpeg";

import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/authContext";
import { makeRequest } from "../../../axios";
import toast from "react-hot-toast";

import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { MdDeleteForever } from "react-icons/md";
import Comment from "./comment/Comment";
import { Link } from "react-router-dom";

const Post = ({ post, getAllPosts }) => {
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    getAllLikes();
    fetchAllComments();
  }, [post]);

  const getAllLikes = async () => {
    try {
      const res = await makeRequest().get(`/posts/likes?postId=${post._id}`);
      setLikes(res.data.data);
    } catch (err) {
      toast.error(err.response.data.message);
    }
  };

  const fetchAllComments = async () => {
    try {
      const res = await makeRequest().get("/comments?postId=" + post._id);
      setComments(res.data.data);
    } catch (err) {
      console.log(err);
      toast.error(err.response.data.message);
    }
  };

  const handleLikeToggle = async () => {
    const liked = likes.indexOf(currentUser._id) !== -1;
    if (liked) {
      // const index = likes.indexOf(currentUser._id);
      // setLikes((prev) => prev.slice(index + 1));
      await makeRequest().delete(`/posts/like/delete?postId=${post._id}`);
    } else {
      // setLikes((prev) => [...prev, currentUser._id]);
      await makeRequest().post("/posts/like/create", { postId: post._id });
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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await makeRequest().post(
        `/comments/create?postId=${post._id}`,
        {
          content: commentInput,
        }
      );
      fetchAllComments();
      toast.success(res.data.message);
      setCommentInput("");
    } catch (err) {
      toast.error(err.response.data.message);
    }
  };

  return (
    <div className="post">
      <div className="post-details">
        <div className="user">
          <img className="current-user-image" src={Image} alt="" />
          <div className="details">
            <p className="name">
              <Link to={`/profile/${post.user._id}`}>
                {post.user.firstName + " " + post.user.lastName}
              </Link>
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
        <div className="likes">
          <div className="like-icon" onClick={handleLikeToggle}>
            {likes.indexOf(currentUser._id) !== -1 ? (
              <AiFillHeart style={{ color: "red" }} />
            ) : (
              <AiOutlineHeart />
            )}
          </div>
          <div className="likes-count count">
            {likes.length}
            <span>{likes.length <= 1 ? " like" : " likes"}</span>
          </div>
        </div>
        <div
          className="comments-count count"
          onClick={() => setShowComments(!showComments)}
        >
          {comments.length}
          <span>{comments.length <= 1 ? " comment" : " comments"}</span>
        </div>
      </div>
      <div className="add-comment">
        <form onSubmit={handleCommentSubmit}>
          <input
            type="text"
            placeholder="Add comment..."
            onChange={(e) => setCommentInput(e.target.value)}
            value={commentInput}
          />
          <input
            type="submit"
            value="Add"
            disabled={commentInput.length === 0}
          />
        </form>
      </div>
      <div
        className="comments-container"
        style={{ display: !showComments ? "none" : "flex" }}
      >
        {showComments &&
          (comments.length === 0 ? (
            <p>No comments yet.</p>
          ) : (
            <>
              {comments.map((comment) => (
                <Comment
                  key={comment._id}
                  comment={comment}
                  currentUser={currentUser}
                  fetchAllComments={fetchAllComments}
                />
              ))}
            </>
          ))}
      </div>
    </div>
  );
};

export default Post;
