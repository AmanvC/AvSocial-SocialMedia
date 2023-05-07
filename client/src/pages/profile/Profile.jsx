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
import ProfileButton from "../../components/profileButton/ProfileButton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Img from "../../components/lazyLoadImage/Img";

const Profile = () => {
  const userId = useLocation().pathname.split("/")[2];

  const { currentUser, updateCurrentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  // const [invalidUser, setInvalidUser] = useState(false);
  const [update, setUpdate] = useState(false);
  const [inputs, setInputs] = useState({});

  const [uploadedProfileImage, setUploadedProfileImage] = useState(null);
  const [uploadedCoverImage, setUploadedCoverImage] = useState(null);

  const queryClient = useQueryClient();

  const {
    isLoading: profileLoading,
    data: userProfile,
    error: profileError,
  } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const res = await makeRequest().get(`/profile/${userId}`);
      return res.data.userDetails;
    },
  });

  const {
    isLoading: relationshipLoading,
    data: relationship,
    error: relationshipError,
  } = useQuery({
    queryKey: ["userRelationship", currentUser._id, userId],
    refetchInterval: 3000,
    queryFn: async () => {
      const res = await makeRequest().get(`/relationship/status/${userId}`);
      return res.data.data;
    },
  });

  const {
    isLoading: postsLoading,
    data: userPosts,
    error: postsError,
  } = useQuery({
    enabled: relationship != null || currentUser._id === userId,
    queryKey: ["posts", userId],
    queryFn: async () => {
      const res = await makeRequest().get(`/profile/${userId}/posts`);
      return res.data.userPosts;
    },
  });

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
      updateCurrentUser(res.data.token);
      queryClient.invalidateQueries(["profile", userId]);
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

  if (profileLoading) {
    return <Loader />;
  }

  // if (invalidUser) {
  //   return <>Invalid user ID</>;
  // }

  return (
    <>
      <div className="profile">
        <div className="user-details-container">
          <div className="images">
            <Img
              className="cover-image"
              src={
                userProfile.coverImage
                  ? `/uploads/${userProfile.coverImage}`
                  : NoCoverImage
              }
              style={{ backgroundColor: "white" }}
            />
            <Img
              className="profile-image"
              src={
                userProfile.profileImage
                  ? `/uploads/${userProfile.profileImage}`
                  : NoUserImage
              }
              style={{ backgroundColor: "white" }}
            />
          </div>
          <div className="user-info">
            <p className="user-name">
              {userProfile.firstName + " " + userProfile.lastName}
            </p>
            <ProfileButton
              userProfile={userProfile}
              currentUser={currentUser}
              updateProfile={updateProfile}
              userId={userId}
              relationship={relationship}
            />
          </div>
        </div>
        {(userPosts && relationship?.status == "Accepted") ||
        currentUser._id == userId ? (
          <div className="posts" style={{ margin: 10 }}>
            {userPosts?.map((post) => (
              <Post key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <h2 style={{ textAlign: "center", opacity: 0.2, marginTop: 50 }}>
            This profile is hidden!
          </h2>
        )}
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
                  <Img
                    src={
                      uploadedProfileImage
                        ? URL.createObjectURL(uploadedProfileImage)
                        : `/uploads/${userProfile.profileImage}`
                    }
                    style={{
                      lineHeight: 9,
                    }}
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
                  <Img
                    src={
                      uploadedCoverImage
                        ? URL.createObjectURL(uploadedCoverImage)
                        : `/uploads/${userProfile.coverImage}`
                    }
                    style={{
                      lineHeight: 9,
                      textAlign: "center",
                    }}
                  />
                </div>
              </div>
              {loading ? (
                <button
                  style={{
                    opacity: 0.5,
                    cursor: "not-allowed",
                    transform: "scale(1)",
                  }}
                >
                  loading...
                </button>
              ) : (
                <button onClick={handleUpdateProfile}>Update</button>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
