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

  useEffect(() => {
    const userToken = getItemFromLocalStorage(LOCALSTORAGE_TOKEN_KEY);
    if (userToken) {
      let user = jwt(userToken);
      setCurrentUser(user);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await makeRequest.post("/users/create-session", {
      email,
      password,
    });
    if (data?.success) {
      setItemInLocalStorage(LOCALSTORAGE_TOKEN_KEY, data.token);
      setCurrentUser(jwt(data.token));
    }
  };

  const logout = () => {
    setCurrentUser(null);
    removeItemFromLocalStorage(LOCALSTORAGE_TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
