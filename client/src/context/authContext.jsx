import { createContext, useEffect, useState } from "react";
import {
  getItemFromLocalStorage,
  removeItemFromLocalStorage,
  setItemInLocalStorage,
} from "../utils";
import {
  LOCALSTORAGE_TOKEN_KEY,
  PRODUCTION,
  SOCKET_LOCAL,
  SOCKET_PRODUCTION,
} from "../utils/constants";
import { makeRequest } from "../axios";
import jwt from "jwt-decode";

import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

export const AuthContext = createContext(null);
const ENDPOINT = PRODUCTION ? SOCKET_PRODUCTION : SOCKET_LOCAL;
let socket = io(ENDPOINT);

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  useEffect(() => {
    const userToken = getItemFromLocalStorage(LOCALSTORAGE_TOKEN_KEY);
    if (userToken) {
      let user = jwt(userToken);
      socket.emit("setup", user);
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  // useEffect(() => {
  //   socket = io(ENDPOINT);
  //   socket.emit("setup", currentUser);
  // }, []);

  const login = async (email, password) => {
    try {
      const res = await makeRequest().post("/users/create-session", {
        email,
        password,
      });
      if (res.data.status === "Pending") {
        toast.error(
          "Email is not verified, please verify it before proceding. Verification email sent."
        );
        return;
      }
      setItemInLocalStorage(LOCALSTORAGE_TOKEN_KEY, res.data.token);
      setCurrentUser(jwt(res.data.token));
      navigate("/");
      socket.emit("setup", jwt(res.data.token));
      toast.success("Logged in successfully.");
    } catch (err) {
      toast.error(err.response.data.message || "Internal server error!");
    }
  };

  const logout = () => {
    setCurrentUser(null);
    removeItemFromLocalStorage(LOCALSTORAGE_TOKEN_KEY);
  };

  const updateCurrentUser = (token) => {
    setItemInLocalStorage(LOCALSTORAGE_TOKEN_KEY, token);
    setCurrentUser(jwt(token));
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, login, logout, updateCurrentUser, loading, socket }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
