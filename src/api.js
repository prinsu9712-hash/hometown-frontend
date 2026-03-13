import axios from "axios";

const stripTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

const normalizeApiBaseUrl = (value) => {
  const normalized = stripTrailingSlash(value);

  if (!normalized) {
    return "/api";
  }

  return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
};

const configuredApiUrl =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5050"
    : "");

export const API_BASE_URL = normalizeApiBaseUrl(configuredApiUrl);

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

export const getApiErrorMessage = (error, fallback = "Request failed.") => {
  const isHostedWithoutApiConfig =
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    !process.env.REACT_APP_API_BASE_URL &&
    !process.env.REACT_APP_API_URL;

  if (isHostedWithoutApiConfig) {
    return "Frontend API URL is not configured. In Vercel add REACT_APP_API_URL or REACT_APP_API_BASE_URL with your backend URL, then redeploy.";
  }

  if (error?.message === "Network Error") {
    return `Cannot reach the backend at ${API_BASE_URL}. Make sure your backend is deployed and CORS allows this Vercel domain.`;
  }

  return error?.response?.data?.message || error?.response?.data?.error || fallback;
};

export default API;
