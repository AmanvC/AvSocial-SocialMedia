import "./profile.scss";

import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { makeRequest } from "../../axios";
import toast from "react-hot-toast";

import { AuthContext } from "../../context/authContext";
import Loader from "../../components/loader/Loader";
import NoUserImage from "../../assets/NoUserImage.png";
import NoCoverImage from "../../assets/NoCoverImage.jpg";
import Post from "../../components/posts/post/Post";

const Profile = () => {
  const userId = useLocation().pathname.split("/")[2];

  const { currentUser, logout } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState({});
  const [userPosts, setUserPosts] = useState({});
  const [loading, setLoading] = useState(true);
  const [invalidUser, setInvalidUser] = useState(false);
  const [update, setUpdate] = useState(false);
  const [inputs, setInputs] = useState({});

  const [uploadedProfileImage, setUploadedProfileImage] = useState(null);
  const [uploadedCoverImage, setUploadedCoverImage] = useState(null);

  useEffect(() => {
    getProfileInfo();
  }, []);

  const getProfileInfo = async () => {
    try {
      setLoading(true);
      const res = await makeRequest().get(`/profile/${userId}`);
      setUserProfile(res.data.userDetails);
      setUserPosts(res.data.userPosts);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (err.response.status === 404) {
        setInvalidUser(true);
        toast.error(err.response.data.message);
        return;
      }
      if (err.response.data === "Unauthorized") {
        logout();
        toast.error("You have been logged out, please login to continue");
        return;
      }
      toast.error(err.response.data.message || "Something went Wrong!");
    }
  };

  const handleInputChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const updateProfile = () => {
    setUpdate(true);
    setInputs({
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      email: userProfile.email,
      profileImage: "",
      coverImage: "",
      userId: userProfile._id,
    });
  };

  const upload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest().post("/upload", formData);
      return res.data;
    } catch (err) {
      toast.error("Could not upload image, something went wrong!");
    }
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    callUpdateProfileAPI();
  };

  const callUpdateProfileAPI = async () => {
    try {
      setLoading(true);
      let profileUrl = "";
      if (uploadedProfileImage) {
        profileUrl = await upload(uploadedProfileImage);
      }
      profileUrl = profileUrl ? profileUrl : userProfile.profileImage;

      let coverUrl = "";
      if (uploadedCoverImage) {
        coverUrl = await upload(uploadedCoverImage);
      }
      coverUrl = coverUrl ? coverUrl : userProfile.coverImage;

      const res = await makeRequest().patch("/profile/update", {
        ...inputs,
        coverImage: coverUrl,
        profileImage: profileUrl,
      });
      setLoading(false);
      setUpdate(false);
      getProfileInfo();
      toast.success(res.data.message);
    } catch (err) {
      setLoading(false);
      toast.error(err.response.data.message);
    }
  };

  const checkUploadedProfileImage = (e) => {
    const fileType = e.target.files[0].type.split("/")[0];
    if (fileType !== "image") {
      e.target.value = null;
      toast.error("Only images can be uploaded!");
      return;
    }
    setUploadedProfileImage(e.target.files[0]);
  };

  const checkUploadedCoverImage = (e) => {
    const fileType = e.target.files[0].type.split("/")[0];
    if (fileType !== "image") {
      e.target.value = null;
      toast.error("Only images can be uploaded!");
      return;
    }
    setUploadedCoverImage(e.target.files[0]);
  };

  if (loading) {
    return <Loader />;
  }

  if (invalidUser) {
    return <>Invalid user ID</>;
  }

  return (
    <>
      <div className="profile">
        <div className="user-details-container">
          <div className="images">
            <img
              src={
                userProfile.coverImage
                  ? `/uploads/${userProfile.coverImage}`
                  : NoCoverImage
              }
              style={{ backgroundColor: "white" }}
              className="cover-image"
            />
            <img
              src={
                userProfile.profileImage
                  ? `/uploads/${userProfile.profileImage}`
                  : NoUserImage
              }
              style={{ backgroundColor: "white" }}
              className="profile-image"
            />
          </div>
          <div className="user-info">
            <p className="user-name">
              {userProfile.firstName + " " + userProfile.lastName}
            </p>
            {userProfile._id === currentUser._id ? (
              <button onClick={updateProfile}>Update Profile</button>
            ) : (
              <button>Add Friend</button>
            )}
          </div>
        </div>
        <div className="posts" style={{ margin: 10 }}>
          {userPosts?.map((post) => (
            <Post key={post._id} post={post} getAllPosts={getProfileInfo} />
          ))}
        </div>
      </div>
      {update && (
        <div className="update-wrapper">
          <div className="update-container">
            <h1>Update Profile</h1>
            <div className="close" onClick={() => setUpdate(false)}>
              ✖
            </div>
            <form onSubmit={handleUpdateProfile}>
              <div className="user-inputs">
                <div className="first-name">
                  <p>First Name: </p>
                  <input
                    type="text"
                    name="firstName"
                    value={inputs.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="last-name">
                  <p>Last Name: </p>
                  <input
                    type="text"
                    name="lastName"
                    value={inputs.lastName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="email">
                  <p>Email: </p>
                  <input
                    type="text"
                    name="email"
                    value={inputs.email}
                    readOnly
                  />
                </div>
              </div>
              <div className="images">
                <div className="profile-image">
                  <label htmlFor="profile">Upload Profile Image</label>
                  <span
                    className="delete-image"
                    onClick={() => setUploadedProfileImage(null)}
                  >
                    ✖
                  </span>
                  <input
                    type="file"
                    id="profile"
                    style={{ display: "none" }}
                    onClick={(e) => (e.target.value = null)}
                    onChange={checkUploadedProfileImage}
                  />
                  <img
                    src={
                      uploadedProfileImage
                        ? URL.createObjectURL(uploadedProfileImage)
                        : `/uploads/${userProfile.profileImage}`
                    }
                    style={{
                      lineHeight: 9,
                    }}
                    alt="No Profile Image"
                  />
                </div>
                <div className="cover-image">
                  <label htmlFor="cover">Upload Cover Image</label>
                  <span
                    className="delete-image"
                    onClick={() => setUploadedCoverImage(null)}
                  >
                    ✖
                  </span>
                  <input
                    type="file"
                    id="cover"
                    style={{ display: "none" }}
                    onClick={(e) => (e.target.value = null)}
                    onChange={checkUploadedCoverImage}
                  />
                  <img
                    src={
                      uploadedCoverImage
                        ? URL.createObjectURL(uploadedCoverImage)
                        : `/uploads/${userProfile.coverImage}`
                    }
                    style={{
                      lineHeight: 9,
                      textAlign: "center",
                    }}
                    alt="No Cover Image."
                  />
                </div>
              </div>
              <button onClick={handleUpdateProfile}>Update</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
