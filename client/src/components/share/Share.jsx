import { useContext, useState } from "react";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import "./share.scss";
import toast from "react-hot-toast";

const Share = ({ fetchPosts }) => {
  const [file, setFile] = useState(null);
  const [postInput, setPostInput] = useState("");

  const { currentUser } = useContext(AuthContext);

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

  const handleAddPost = async (e) => {
    e.preventDefault();
    try {
      let imgUrl = "";
      if (file) {
        imgUrl = await upload();
      }
      await makeRequest().post("/posts", {
        content: postInput,
        image: imgUrl,
      });
      setPostInput("");
      setFile(null);
      fetchPosts();
      toast.success("Post Created Successfully.");
    } catch (err) {
      toast.error("Something went wrong while creating a new Post!");
    }
  };

  const handleFileChange = (e) => {
    e.preventDefault();
    setFile(e.target.files[0]);
  };

  // console.log(file);

  return (
    <div className="share">
      <div className="post-inputs">
        <textarea
          name="content"
          rows="3"
          placeholder={"What's on your mind, " + currentUser.firstName + "?"}
          value={postInput}
          onChange={(e) => setPostInput(e.target.value)}
        />
        {file && (
          <img className="file" alt="" src={URL.createObjectURL(file)} />
        )}
      </div>
      <div className="action-buttons">
        <input
          type="file"
          id="file"
          style={{ display: "none" }}
          onClick={(e) => (e.target.value = null)}
          onChange={handleFileChange}
        />
        <label htmlFor="file" className="add-image">
          Upload Image
        </label>
        <button onClick={handleAddPost} disabled={!(postInput || file)}>
          Add Post
        </button>
      </div>
    </div>
  );
};

export default Share;
