import "./stories.scss";
import Story from "./story/Story";
import { IoMdAddCircle } from "react-icons/io";
import { TbFaceIdError } from "react-icons/tb";
import { useState } from "react";
import { makeRequest } from "../../axios";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const Stories = () => {
  const [file, setFile] = useState(null);
  const queryClient = useQueryClient();

  const {
    isLoading,
    data: stories,
    error,
  } = useQuery({
    queryKey: ["stories"],
    queryFn: async () => {
      const res = await makeRequest().get("/stories");
      return res.data.stories;
    },
  });

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
      queryClient.invalidateQueries(["stories"]);
      toast.success("Story Added Successfully.");
    } catch (err) {
      toast.error("Something went wrong, story cannot be added!");
    }
  };

  console.log(error);

  if (error) {
    toast.error(error.response?.data?.message || "Something went wrong!");
  }

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
      {isLoading ? (
        <div className="loading-wrapper">
          <div className="loading"></div>
        </div>
      ) : error ? (
        <div className="error-wrapper">
          <p className="error-message">
            <TbFaceIdError />{" "}
            <span className="text">Something went wrong!</span>
          </p>
        </div>
      ) : (
        stories.map((story) => {
          return <Story key={story._id} story={story} />;
        })
      )}
    </div>
  );
};

export default Stories;
