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

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [searchInput, setSearchInput] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showUserOptions, setShowUserOptions] = useState(false);

  useEffect(() => {
    // todo
    console.log("Input changed!");
  }, [searchInput]);

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
  OutsideClick(userOptionRef, setShowUserOptions);
  OutsideClick(searchRef, setShowSearch);

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
            value={searchInput}
          />
          {showSearch && <span onClick={() => setShowSearch(false)}>✖</span>}
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
                  <li>
                    <Link to={`/profile/${currentUser._id}`}>
                      <AiOutlineUser /> <span>Profile</span>
                    </Link>
                  </li>
                  <li>
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
