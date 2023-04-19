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
import { makeRequest } from "../../axios";

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [searchInput, setSearchInput] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showUserOptions, setShowUserOptions] = useState(false);
  const [showResultContainer, setShowResultContainer] = useState(false);
  const [searchedResult, setSearchedResult] = useState([]);
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
    }, [ref]);
  };

  const userOptionRef = useRef(null);
  const searchRef = useRef(null);
  const resultRef = useRef(null);
  OutsideClick(userOptionRef, setShowUserOptions);
  OutsideClick(searchRef, setShowSearch);
  OutsideClick(resultRef, setShowResultContainer);

  const handleSearchUser = async () => {
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
                              <img
                                src={
                                  result.profileImage
                                    ? `/uploads/${result.profileImage}`
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
                    <p style={{ padding: 0, fontWeight: 600 }}>
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
          <div className="user-details">
            <img
              src={
                currentUser.profileImage
                  ? `/uploads/${currentUser.profileImage}`
                  : NoUserImage
              }
              className="user-info"
              onClick={() => setShowUserOptions(!showUserOptions)}
            />
            {showUserOptions && (
              <div className="user-options" ref={userOptionRef}>
                <ul>
                  <li onClick={() => setShowUserOptions(false)}>
                    <Link to={`/profile/${currentUser._id}`}>
                      <AiOutlineUser /> <span>Profile</span>
                    </Link>
                  </li>
                  <li onClick={() => setShowUserOptions(false)}>
                    <Link to={`/settings`}>
                      <TbSettings /> <span>Settings</span>
                    </Link>
                  </li>
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
