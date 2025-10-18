import apiClient from "./api";
import { removeAuthToken } from "../utils/cookies";

const authService = {
  /**
   * User signup
   * @param {Object} userData - { name, email, contact, password }
   * @returns {Promise}
   */
  signup: async (userData) => {
    try {
      const response = await apiClient.post("/signup", userData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Signup failed",
      };
    }
  },

  /**
   * User login
   * @param {Object} credentials - { email, password }
   * @returns {Promise}
   */
  login: async (credentials) => {
    try {
      const response = await apiClient.post("/login", credentials);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  },

  /**
   * Send OTP to email
   * @param {string} email
   * @returns {Promise}
   */
  sendOTP: async (email) => {
    try {
      const response = await apiClient.post("/sendOtp", { email });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to send OTP",
      };
    }
  },

  /**
   * Send OTP via SMS or Email
   * @param {Object} data - { contact, email, method: 'sms' or 'email' }
   * @returns {Promise}
   */
  sendOTPWithMethod: async (data) => {
    try {
      const response = await apiClient.post("/sendOtp", data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to send OTP",
      };
    }
  },

  /**
   * Verify OTP
   * @param {Object} data - { email, otp }
   * @returns {Promise}
   */
  verifyOTP: async (data) => {
    try {
      const response = await apiClient.post("/verifyOtp", data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "OTP verification failed",
      };
    }
  },

  /**
   * Verify Firebase Phone OTP
   * @param {Object} data - { email, contact, firebaseToken }
   * @returns {Promise}
   */
  verifyPhoneOTP: async (data) => {
    try {
      const response = await apiClient.post("/verifyPhoneOtp", data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Phone verification failed",
      };
    }
  },

  /**
   * Change password
   * @param {Object} data - { email, password }
   * @returns {Promise}
   */
  changePassword: async (data) => {
    try {
      const response = await apiClient.post("/changePassword", data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Password change failed",
      };
    }
  },

  /**
   * Logout user
   * @returns {Promise}
   */
  logout: async () => {
    try {
      const response = await apiClient.post("/logout");
      removeAuthToken(); // Remove token from cookies
      sessionStorage.clear();
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      // Clear local data even if API fails
      removeAuthToken(); // Remove token from cookies
      sessionStorage.clear();
      return {
        success: false,
        error: error.response?.data?.message || "Logout failed",
      };
    }
  },
};

export default authService;
