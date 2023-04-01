import axios from "axios";
import { LOCALSTORAGE_TOKEN_KEY } from "./utils/constants";
import { getItemFromLocalStorage } from "./utils/index";

export const makeRequest = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  headers: {
    authorization: "Bearer " + getItemFromLocalStorage(LOCALSTORAGE_TOKEN_KEY),
  },
});
