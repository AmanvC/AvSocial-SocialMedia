import "./comment.scss";
import NoUserImage from "../../../../assets/NoUserImage.png";
import { makeRequest } from "../../../../axios";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import moment from "moment";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { Link } from "react-router-dom";

const Comment = ({ comment, currentUser, fetchAllComments }) => {
  const [likes, setLikes] = useState([]);

  useEffect(() => {
    getCommentLikes();
  }, []);

  const getCommentLikes = async () => {
    try {
      const res = await makeRequest().get(
        `/comments/like?commentId=${comment._id}`
      );
      setLikes(res.data.data);
    } catch (err) {
      toast.error(err.response.data.message);
    }
  };

  const handleLikeToggle = async () => {
    try {
      const liked = likes.indexOf(currentUser._id) !== -1;
      if (liked) {
        await makeRequest().delete(
          `/comments/delete/like?commentId=${comment._id}`
        );
      } else {
        await makeRequest().post(
          `/comments/create/like?commentId=${comment._id}`
        );
      }
      getCommentLikes();
    } catch (err) {
      toast.error(err.response.data.message);
    }
  };

  const deleteComment = async () => {
    try {
      const res = await makeRequest().delete(
        `/comments/delete?commentId=${comment._id}`
      );
      fetchAllComments();
      toast.success("Comment deleted successfully.");
    } catch (err) {
      toast.error(err.response.data.message);
    }
  };

  return (
    <div className="comment">
      <div className="profile-image">
        <img
          src={
            comment.user.profileImage
              ? `/uploads/${comment.user.profileImage}`
              : NoUserImage
          }
          alt=""
        />
      </div>
      <div className="comment-content">
        <div className="name">
          <Link to={`/profile/${comment.user._id}`}>
            {comment.user.firstName + " " + comment.user.lastName}
          </Link>
        </div>
        <div className="details">
          <p className="likes-count">
            {likes.length}
            <span>{likes.length <= 1 ? " like" : " likes"}</span>
          </p>
          {currentUser._id === comment.user._id && (
            <p className="delete" onClick={deleteComment}>
              delete
            </p>
          )}
          <p className="time">{moment(comment.createdAt).fromNow()}</p>
        </div>
        <div className="comment-content-text">{comment.content}</div>
      </div>
      <div className="like-action">
        <span className="like-icon" onClick={handleLikeToggle}>
          {likes.indexOf(currentUser._id) !== -1 ? (
            <AiFillHeart style={{ color: "red" }} />
          ) : (
            <AiOutlineHeart />
          )}
        </span>
      </div>
    </div>
  );
};

export default Comment;
