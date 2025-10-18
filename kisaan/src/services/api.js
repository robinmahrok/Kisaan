import axios from "axios";
import { baseUrl } from "../baseUrl";
import { getAuthToken } from "../utils/cookies";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: baseUrl,
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Request interceptor - Add auth token from cookies to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken(); // Get token from cookies instead of localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token from cookies and redirect to login
          const { removeAuthToken } = require("../utils/cookies");
          removeAuthToken();
          if (window.location.pathname !== "/") {
            window.location.href = "/";
          }
          break;
        case 403:
          console.error("Forbidden access");
          break;
        case 404:
          console.error("Resource not found");
          break;
        case 500:
          console.error("Server error");
          break;
        default:
          console.error("API Error:", data?.message || "Unknown error");
      }
    } else if (error.request) {
      // Request made but no response
      console.error("Network error - no response from server");
    } else {
      // Something else happened
      console.error("Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
