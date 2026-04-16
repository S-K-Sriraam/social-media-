import axios from "axios";

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

export const API_BASE_URL = process.env.REACT_APP_API_URL
  ? trimTrailingSlash(process.env.REACT_APP_API_URL.trim())
  : "";

export const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL?.trim() ||
  API_BASE_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:5000" : "");

export const configureApiClient = () => {
  if (API_BASE_URL) {
    axios.defaults.baseURL = API_BASE_URL;
  }
};
