import "./post.scss";
import NoUserImage from "../../../assets/NoUserImage.png";

import moment from "moment";
import { useContext, useState } from "react";
import { AuthContext } from "../../../context/authContext";
import { makeRequest } from "../../../axios";
import toast from "react-hot-toast";

import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { MdDeleteForever } from "react-icons/md";
import Comment from "./comment/Comment";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Img from "../../lazyLoadImage/Img";

const Post = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const {
    isLoading: commentsLoading,
    data: comments,
    // error: commentsError,
  } = useQuery({
    queryKey: ["postComments", post._id],
    queryFn: async () => {
      const res = await makeRequest().get("/comments?postId=" + post._id);
      return res.data.data;
    },
  });

  const {
    isLoading: likesLoading,
    data: likes,
    // error: likesError,
  } = useQuery({
    queryKey: ["postLikes", post._id],
    queryFn: async () => {
      const res = await makeRequest().get(`/posts/likes?postId=${post._id}`);
      return res.data.data;
    },
  });

  const likesMutation = useMutation({
    mutationFn: async (liked) => {
      if (liked) {
        return makeRequest().delete(`/posts/like/delete?postId=${post._id}`);
      }
      return makeRequest().post("/posts/like/create", { postId: post._id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["postLikes", post._id], { exact: true });
    },
  });

  const handleLikeToggle = async () => {
    const liked = likes.indexOf(currentUser._id) !== -1;
    likesMutation.mutate(liked);
  };

  const deletePostMutation = useMutation({
    mutationFn: () => {
      return makeRequest().delete(`/posts?postId=${post._id}`);
    },
    onSuccess: (res) => {
      toast.success(res?.data?.message || "Post deleted successfully.");
      queryClient.invalidateQueries(["posts", "infinite", currentUser._id]);
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  const deletePost = async () => {
    deletePostMutation.mutate();
  };

  const submitCommentMutation = useMutation({
    mutationFn: async () => {
      return await makeRequest().post(`/comments/create?postId=${post._id}`, {
        content: commentInput,
      });
    },
    onSuccess: (res) => {
      toast.success(res.data.message);
      setCommentInput("");
      queryClient.invalidateQueries(["postComments", post._id], {
        exact: true,
      });
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    submitCommentMutation.mutate();
  };

  return (
    <div className="post">
      <div className="post-details">
        <div className="user">
          <Img
            className="current-user-image"
            src={
              post.user.profileImage
                ? `/uploads/${post.user.profileImage}`
                : NoUserImage
            }
          />
          {commentsLoading ? (
            <p>loading...</p>
          ) : (
            <div className="details">
              <p className="name">
                <Link to={`/profile/${post.user._id}`}>
                  {post.user.firstName + " " + post.user.lastName}
                </Link>
              </p>
              <p className="time">{moment(post.createdAt).fromNow()}</p>
            </div>
          )}
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
            <Img src={"/uploads/" + post.image} />
          </div>
        )}
      </div>
      <div className="actions-container">
        {likesLoading ? (
          <p>loading...</p>
        ) : (
          <div className="likes">
            <div className="like-icon" onClick={handleLikeToggle}>
              {likes?.indexOf(currentUser._id) !== -1 ? (
                <AiFillHeart style={{ color: "red" }} />
              ) : (
                <AiOutlineHeart />
              )}
            </div>
            <div className="likes-count count">
              {likes?.length}
              <span>{likes?.length <= 1 ? " like" : " likes"}</span>
            </div>
          </div>
        )}
        {commentsLoading ? (
          <p>loading...</p>
        ) : (
          <div
            className="comments-count count"
            onClick={() => setShowComments(!showComments)}
          >
            {comments?.length}
            <span>{comments?.length <= 1 ? " comment" : " comments"}</span>
          </div>
        )}
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
          (comments?.length === 0 ? (
            <p>No comments yet.</p>
          ) : (
            <>
              {comments?.map((comment) => (
                <Comment
                  key={comment._id}
                  comment={comment}
                  currentUser={currentUser}
                  postId={post._id}
                />
              ))}
            </>
          ))}
      </div>
    </div>
  );
};

export default Post;
