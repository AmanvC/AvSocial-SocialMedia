import "./leftBar.scss";

import { Link } from "react-router-dom";
import { BiLinkExternal } from "react-icons/bi";
import { RiContactsBook2Fill } from "react-icons/ri";

const LeftBar = () => {
  return (
    <div className="leftbar">
      <h3>More Apps</h3>
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
