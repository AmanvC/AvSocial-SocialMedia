import { Link } from "react-router-dom";
import "./pageNotFound.scss";

const PageNotFound = () => {
  return (
    <div className="page-not-found">
      <div>
        <h1>Are you lost?</h1>
        <p>
          The page you're looking for does not exist{" "}
          <span style={{ textDecoration: "underline" }}>yet!</span>
        </p>
      </div>
      <div>
        <h3>Don't worry, we'll steer you to safety.</h3>
        <Link to="/">
          <button>
            Go back home <span></span>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </Link>
      </div>
    </div>
  );
};

export default PageNotFound;
