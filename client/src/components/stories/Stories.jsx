import "./stories.scss";
import Story from "./story/Story";
import { IoMdAddCircle } from "react-icons/io";
import { useEffect, useState } from "react";
import { makeRequest } from "../../axios";
import toast from "react-hot-toast";

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await makeRequest().get("/stories");
      setStories(res?.data?.stories);
    } catch (err) {
      toast.error(err?.response?.data?.message);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const upload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest().post("/upload", formData);
      return res.data;
    } catch (err) {
      toast.error("Could not upload image, something went wrong!");
    }
  };

  const handleUpload = async () => {
    try {
      const imgUrl = await upload();
      await makeRequest().post("/stories/create", {
        image: imgUrl,
      });
      setFile(null);
      fetchStories();
      toast.success("Story Added Successfully.");
    } catch (err) {
      toast.error("Something went wrong, story cannot be added!");
    }
  };

  return (
    <div className="stories">
      {!file && (
        <div className="upload-story">
          <p className="text">Add Story</p>
          <input
            type="file"
            id="uploadStory"
            style={{ display: "none" }}
            onClick={(e) => (e.target.value = null)}
            onChange={handleFileChange}
          />
          <label htmlFor="uploadStory">
            <IoMdAddCircle className="add" />
          </label>
        </div>
      )}
      {file && (
        <div className="uploaded-image">
          <div className="form">
            <img className="file" alt="" src={URL.createObjectURL(file)} />
            <div className="buttons">
              <button className="upload" onClick={handleUpload}>
                Upload
              </button>
              <button className="cancel" onClick={() => setFile(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {stories.map((story) => {
        return <Story story={story} />;
      })}
      {/* <Story /> */}
    </div>
  );
};

export default Stories;
