import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthContextProvider } from "./context/authContext";
import { ToastProvider } from "react-toast-notifications";
import { StrictMode } from "react";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthContextProvider>
          <App />
        </AuthContextProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
