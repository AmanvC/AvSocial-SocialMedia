import "./comment.scss";
import NoUserImage from "../../../../assets/NoUserImage.png";
import { makeRequest } from "../../../../axios";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import moment from "moment";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const Comment = ({ comment, currentUser, postId }) => {
  const queryClient = useQueryClient();

  const {
    isLoading,
    data: likes,
    error,
  } = useQuery({
    queryKey: ["commentLikes", comment._id],
    queryFn: async () => {
      const res = await makeRequest().get(
        `/comments/like?commentId=${comment._id}`
      );
      return res.data.data;
    },
  });

  const commentLikesMutation = useMutation({
    mutationFn: (liked) => {
      if (liked) {
        return makeRequest().delete(
          `/comments/delete/like?commentId=${comment._id}`
        );
      }
      return makeRequest().post(
        `/comments/create/like?commentId=${comment._id}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["commentLikes", comment._id], {
        exact: true,
      });
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  const handleLikeToggle = async () => {
    const liked = likes.indexOf(currentUser._id) !== -1;
    commentLikesMutation.mutate(liked);
  };

  const deleteCommentMutation = useMutation({
    mutationFn: () => {
      return makeRequest().delete(`/comments/delete?commentId=${comment._id}`);
    },
    onSuccess: () => {
      toast.success("Comment deleted successfully.");
      queryClient.invalidateQueries(["postComments", postId], { exact: true });
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  const deleteComment = () => {
    deleteCommentMutation.mutate();
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
            {likes?.length}
            <span>{likes?.length <= 1 ? " like" : " likes"}</span>
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
          {likes?.indexOf(currentUser._id) !== -1 ? (
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
