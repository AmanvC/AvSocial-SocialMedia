import "./post.scss";
import Image from "../../../assets/test.jpeg";

import moment from "moment";

const Post = ({ post }) => {
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
    </div>
  );
};

export default Post;
