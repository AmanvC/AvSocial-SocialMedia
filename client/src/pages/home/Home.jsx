import "./home.scss";

import Stories from "../../components/stories/Stories";
import Posts from "../../components/posts/Posts";
import { useState } from "react";
import { useEffect } from "react";
import { makeRequest } from "../../axios";

const Home = () => {
  return (
    <div className="home">
      <Stories />
      <Posts />
    </div>
  );
};

export default Home;
