import { Navigate, Route, Routes } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/authContext";
import { Toaster } from "react-hot-toast";

import "./App.scss";

import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Header from "./components/header/Header";
import Home from "./pages/home/Home";
import PageNotFound from "./pages/404/PageNotFound";
import LeftBar from "./components/leftBar/LeftBar";
import RightBar from "./components/rightBar/RightBar";
import ContentWrapper from "./components/contentWrapper/ContentWrapper";
import Profile from "./pages/profile/Profile";
import Loader from "./components/loader/Loader";

function App() {
  const { currentUser, loading } = useContext(AuthContext);

  const Layout = ({ children }) => {
    return (
      <div className="layout">
        <Header />
        <div className="content">
          <ContentWrapper>
            <LeftBar />
            <div className="children">{children}</div>
            <RightBar />
          </ContentWrapper>
        </div>
      </div>
    );
  };

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="App">
      <Toaster />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  );
}

export default App;
