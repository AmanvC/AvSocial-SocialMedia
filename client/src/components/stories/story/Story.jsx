import { useContext, useState } from "react";
import moment from "moment";
import toast from "react-hot-toast";

import "./story.scss";

import { AuthContext } from "../../../context/authContext";
import Image from "../../../assets/test.jpeg";
import { makeRequest } from "../../../axios";
import { Link } from "react-router-dom";

const Story = ({ story, fetchStories }) => {
  const [showStory, setShowStory] = useState(false);

  const { currentUser } = useContext(AuthContext);

  const deleteStory = async () => {
    try {
      await makeRequest().delete(`/stories/delete?storyId=${story._id}`);
      toast.success("Story deleted successfully.");
      fetchStories();
    } catch (err) {
      toast.error(err.response.data.message);
    }
  };

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
              <img src={Image} alt="" className="user-image" />
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
              <button className="delete" onClick={deleteStory}>
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
