import axios from "axios";

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

export const API_BASE_URL = process.env.REACT_APP_API_URL
  ? trimTrailingSlash(process.env.REACT_APP_API_URL.trim())
  : "";

export const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL?.trim() ||
  API_BASE_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:5000" : "");

export const isHostedOnGitHubPages = () =>
  typeof window !== "undefined" && window.location.hostname.endsWith("github.io");

export const getMissingApiUrlMessage = () => {
  if (process.env.NODE_ENV === "production" && isHostedOnGitHubPages() && !API_BASE_URL) {
    return "Signup needs a hosted backend API. Add REACT_APP_API_URL in GitHub repository variables and redeploy.";
  }

  return "";
};

export const assertApiIsConfigured = () => {
  const message = getMissingApiUrlMessage();
  if (message) {
    throw new Error(message);
  }
};

export const configureApiClient = () => {
  if (API_BASE_URL) {
    axios.defaults.baseURL = API_BASE_URL;
  }
};
