import { useContext, useState } from "react";
import { useToasts } from "react-toast-notifications";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import "./share.scss";

const Share = ({ fetchPosts }) => {
  const [file, setFile] = useState(null);
  const [postInput, setPostInput] = useState("");
  const { addToast } = useToasts();

  const { currentUser } = useContext(AuthContext);

  const upload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest().post("/upload", formData);
      return res.data;
    } catch (err) {
      addToast("Could not upload image, something went wrong!", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const handleAddPost = async (e) => {
    e.preventDefault();
    try {
      let imgUrl = "";
      if (file) {
        imgUrl = await upload();
      }
      await makeRequest().post("/posts/create", {
        content: postInput,
        image: imgUrl,
      });
      setPostInput("");
      setFile(null);
      fetchPosts();
      addToast("Post created successfully.", {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (err) {
      addToast("Something went wrong while creating a new Post!", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  console.log(postInput);

  return (
    <div className="share">
      <textarea
        name="content"
        rows="3"
        placeholder={"What's on your mind, " + currentUser.firstName + "?"}
        value={postInput}
        onChange={(e) => setPostInput(e.target.value)}
      />
      <div className="action-buttons">
        <input
          type="file"
          id="file"
          style={{ display: "none" }}
          onChange={(e) => setFile(e.target.files[0])}
        />
        <label htmlFor="file" className="add-image">
          Upload Image
        </label>
        <button onClick={handleAddPost}>Add Post</button>
      </div>
    </div>
  );
};

export default Share;
