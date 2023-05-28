import axios from "axios";
import {
  LOCALSTORAGE_TOKEN_KEY,
  LOCAL_URL,
  PRODUCTION,
  PRODUCTION_URL,
} from "./utils/constants";
import { getItemFromLocalStorage } from "./utils/index";

export const makeRequest = () => {
  const token = getItemFromLocalStorage(LOCALSTORAGE_TOKEN_KEY);

  return axios.create({
    baseURL: PRODUCTION ? PRODUCTION_URL : LOCAL_URL,
    headers: {
      authorization: "Bearer " + token,
    },
  });
};
