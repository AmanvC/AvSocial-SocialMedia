import { createContext, useEffect, useState } from "react";
import {
  getItemFromLocalStorage,
  removeItemFromLocalStorage,
  setItemInLocalStorage,
} from "../utils";
import { LOCALSTORAGE_TOKEN_KEY } from "../utils/constants";
import { makeRequest } from "../axios";
import jwt from "jwt-decode";

import toast from "react-hot-toast";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userToken = getItemFromLocalStorage(LOCALSTORAGE_TOKEN_KEY);
    if (userToken) {
      let user = jwt(userToken);
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await makeRequest().post("/users/create-session", {
        email,
        password,
      });
      setItemInLocalStorage(LOCALSTORAGE_TOKEN_KEY, res.data.token);
      setCurrentUser(jwt(res.data.token));
    } catch (err) {
      toast.error(err.response.data.message || "Internal server error!");
    }
  };

  const logout = () => {
    setCurrentUser(null);
    removeItemFromLocalStorage(LOCALSTORAGE_TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
