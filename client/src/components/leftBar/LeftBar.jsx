import "./leftBar.scss";

import { Link } from "react-router-dom";
import { BiLinkExternal } from "react-icons/bi";
import { RiContactsBook2Fill } from "react-icons/ri";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import { CgHello } from "react-icons/cg";

const LeftBar = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="leftbar">
      <h3>More Apps</h3>
      <p style={{ padding: 5, marginBottom: 20, fontWeight: 600 }}>
        Hi, {currentUser.firstName + " " + currentUser.lastName}{" "}
        <CgHello style={{ paddingTop: 5, fontSize: 20 }} />
      </p>
      <ul>
        <li>
          <Link target="_blank" to={"https://imovies-react.netlify.app/"}>
            <BiLinkExternal /> Explore Movies
          </Link>
        </li>
        <li>
          <Link target="_blank" to={"https://rcl-contacts-list.netlify.app/"}>
            <RiContactsBook2Fill /> Manage Contacts
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default LeftBar;
