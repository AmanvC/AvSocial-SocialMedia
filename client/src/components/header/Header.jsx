import "./header.scss";
import ContentWrapper from "../contentWrapper/ContentWrapper";
import { AuthContext } from "../../context/authContext";
import NoUserImage from "../../assets/NoUserImage.png";

import { useContext, useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AiOutlineUser } from "react-icons/ai";
import { TbSettings } from "react-icons/tb";
import { MdPersonSearch, MdLogout } from "react-icons/md";
import { FaUserFriends } from "react-icons/fa";
import { BiLinkExternal } from "react-icons/bi";
import { RiContactsBook2Fill } from "react-icons/ri";
import { makeRequest } from "../../axios";
import PendingRequests from "../pendingRequests/PendingRequests";
import Img from "../lazyLoadImage/Img";

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [searchInput, setSearchInput] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showUserOptions, setShowUserOptions] = useState(false);
  const [showResultContainer, setShowResultContainer] = useState(false);
  const [searchedResult, setSearchedResult] = useState([]);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogoutClick = () => {
    logout();
    toast.success("Logged out successfully.");
  };

  const OutsideClick = (ref, state) => {
    useEffect(() => {
      const handleOutsideClick = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
          state(false);
        }
      };
      // add the event listener
      document.addEventListener("mousedown", handleOutsideClick);
    }, [ref, state]);
  };

  const userOptionRef = useRef(null);
  const searchRef = useRef(null);
  const resultRef = useRef(null);
  const friendRequestsRef = useRef(null);
  OutsideClick(userOptionRef, setShowUserOptions);
  OutsideClick(searchRef, setShowSearch);
  OutsideClick(resultRef, setShowResultContainer);
  OutsideClick(friendRequestsRef, setShowFriendRequests);

  const handleSearchUser = async (e) => {
    if (searchInput.length > 2) {
      setLoading(true);
      const res = await makeRequest().get(
        `/profile/search/user?username=${searchInput}`
      );
      setSearchedResult(res.data.data);
      setLoading(false);
    } else {
      setSearchedResult([]);
    }
  };

  return (
    <div className="header">
      <ContentWrapper>
        <div className="brand-container">
          <Link to="/">
            <h1>AvSocial</h1>
          </Link>
        </div>
        <div className="search-container">
          <input
            ref={searchRef}
            className={showSearch ? "show-search" : ""}
            type="text"
            placeholder="Search user..."
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyUp={handleSearchUser}
            value={searchInput}
            onClick={() => setShowResultContainer(true)}
          />
          {showResultContainer && (
            <>
              {searchInput.length > 2 && (
                <div className="searched-results" ref={resultRef}>
                  {loading ? (
                    <div className="loading-wrapper">
                      <div className="loading"></div>
                    </div>
                  ) : searchedResult.length > 0 ? (
                    <>
                      {searchedResult.map((result) => (
                        <div key={result._id}>
                          <Link
                            to={`/profile/${result._id}`}
                            onClick={() => setShowResultContainer(false)}
                          >
                            <div className="searched-user-card">
                              <Img
                                src={
                                  result.profileImage
                                    ? result.profileImage
                                    : NoUserImage
                                }
                              />
                              <p className="name">
                                {result.firstName + " " + result.lastName}
                              </p>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p style={{ padding: "15px 10px", fontWeight: 600 }}>
                      No user found.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
          {showSearch && (
            <span className="close-search" onClick={() => setShowSearch(false)}>
              ✖
            </span>
          )}
        </div>
        <div className="actions">
          <p
            className="search-small-screen"
            onClick={() => setShowSearch(true)}
          >
            <MdPersonSearch />
          </p>
          <div className="friend-request-small-screen">
            <FaUserFriends onClick={() => setShowFriendRequests(true)} />
            {showFriendRequests && (
              <div className="friends-container" ref={friendRequestsRef}>
                <PendingRequests />
              </div>
            )}
          </div>
          <div className="user-details">
            <img
              src={
                currentUser.profileImage
                  ? currentUser.profileImage
                  : NoUserImage
              }
              className="user-info"
              onClick={() => setShowUserOptions(!showUserOptions)}
              alt="user"
            />
            {showUserOptions && (
              <div className="user-options" ref={userOptionRef}>
                <ul>
                  <Link to={`/profile/${currentUser._id}`}>
                    <li onClick={() => setShowUserOptions(false)}>
                      <AiOutlineUser /> <span>Profile</span>
                    </li>
                  </Link>
                  <Link to={`/settings`}>
                    <li onClick={() => setShowUserOptions(false)}>
                      <TbSettings /> <span>Settings</span>
                    </li>
                  </Link>
                  <Link
                    target="_blank"
                    to={"https://imovies-react.netlify.app/"}
                  >
                    <li>
                      <BiLinkExternal /> Explore Movies
                    </li>
                  </Link>
                  <Link
                    target="_blank"
                    to={"https://rcl-contacts-list.netlify.app/"}
                  >
                    <li>
                      <RiContactsBook2Fill /> Manage Contacts
                    </li>
                  </Link>
                  <li onClick={handleLogoutClick}>
                    <MdLogout /> <span>Logout</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </ContentWrapper>
    </div>
  );
};

export default Header;
