import "./story.scss";
import Image from "../../../assets/test.jpeg";

const Story = ({ story }) => {
  return (
    <div className="story">
      <div className="layer"></div>
      <img src={`/uploads/${story.image}`} />
    </div>
  );
};

export default Story;
