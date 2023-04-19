import "./story.scss";
import NoUserImage from "../../../assets/NoUserImage.png";

import { useContext, useState } from "react";
import moment from "moment";
import toast from "react-hot-toast";

import { AuthContext } from "../../../context/authContext";
import { makeRequest } from "../../../axios";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const Story = ({ story }) => {
  const [showStory, setShowStory] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const deleteStoryMutation = useMutation({
    mutationFn: () => {
      return makeRequest().delete(`/stories/delete?storyId=${story._id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["stories"]);
      toast.success("Story deleted successfully.");
    },
    onError: (res) => {
      toast.error(res.response.data.message);
    },
  });

  return (
    <>
      {!showStory ? (
        <div className="story" onClick={() => setShowStory(true)}>
          <div className="layer">
            <span className="text">{story.user.firstName}</span>
            <span className="text">{story.user.lastName}</span>
          </div>
          <img src={`/uploads/${story.image}`} />
        </div>
      ) : (
        <div className="show-story-wrapper">
          <div className="show-story">
            <div className="user-details">
              <img
                src={
                  story.user.profileImage
                    ? `/uploads/${story.user.profileImage}`
                    : NoUserImage
                }
                alt=""
                className="user-image"
              />
              <div className="details">
                <p className="user-name">
                  <Link to={`/profile/${story.user._id}`}>
                    {story.user.firstName + " " + story.user.lastName}
                  </Link>
                </p>
                <p className="moment">{moment(story.createdAt).fromNow()}</p>
              </div>
            </div>
            <span className="close" onClick={() => setShowStory(false)}>
              ✖
            </span>
            <img className="view-story" src={`/uploads/${story.image}`} />
            {currentUser._id === story.user._id && (
              <button
                className="delete"
                onClick={() => deleteStoryMutation.mutate()}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Story;
