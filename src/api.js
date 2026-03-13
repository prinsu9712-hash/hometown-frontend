import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5050/api";

const API = axios.create({
  baseURL: API_BASE_URL
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const getApiErrorMessage = (error, fallback = "Something went wrong.") => {
  if (error?.message === "Network Error") {
    return `Cannot reach the backend API at ${API_BASE_URL}. Make sure the backend server is running.`;
  }

  return error?.response?.data?.message || error?.response?.data?.error || fallback;
};

export default API;
