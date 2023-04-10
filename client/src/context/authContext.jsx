import { createContext, useEffect, useState } from "react";
import {
  getItemFromLocalStorage,
  removeItemFromLocalStorage,
  setItemInLocalStorage,
} from "../utils";
import { LOCALSTORAGE_TOKEN_KEY } from "../utils/constants";
import { makeRequest } from "../axios";
import jwt from "jwt-decode";

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
    setLoading(true);
    const { data } = await makeRequest().post("/users/create-session", {
      email,
      password,
    });
    if (data?.success) {
      setItemInLocalStorage(LOCALSTORAGE_TOKEN_KEY, data.token);
      setCurrentUser(jwt(data.token));
    }
    setLoading(false);
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
