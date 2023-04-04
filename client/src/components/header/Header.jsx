import "./header.scss";
import ContentWrapper from "../contentWrapper/ContentWrapper";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [searchInput, setSearchInput] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    // todo
    console.log("Input changed!");
  }, [searchInput]);

  const handleLogoutClick = () => {
    logout();
    toast.success("Logged out successfully.");
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
            🔍
          </p>
          <p className="user-name">{currentUser.firstName}</p>
          <button className="logout" onClick={handleLogoutClick}>
            Logout
          </button>
        </div>
      </ContentWrapper>
    </div>
  );
};

export default Header;
