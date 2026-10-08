import axios from "axios";
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

// Login/register return 401 for wrong credentials. That must show an
// error message, not trigger a page reload to /login.
const AUTH_ATTEMPT_PATHS = ["/auth/login", "/auth/register"];

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // For FormData we intentionally do NOT set Content-Type:
    // the browser adds multipart/form-data with the correct boundary.
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        const url = error.config?.url || "";
        const isAuthAttempt = AUTH_ATTEMPT_PATHS.some((path) =>
          url.includes(path)
        );

        if (!isAuthAttempt) {
          localStorage.removeItem("token");

          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
      } else if (error.response.status === 500) {
        console.error("Server error:", error.response.data);
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout:", error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;