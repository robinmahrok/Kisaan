import apiClient from "./api";

const requestService = {
  /**
   * Get all requests for the authenticated user
   * Token is automatically sent in headers by apiClient
   * @returns {Promise}
   */
  getAllRequests: async () => {
    try {
      const response = await apiClient.get("/allRequests");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch requests",
      };
    }
  },

  /**
   * Get request data/status
   * @param {Object} requestData - Request details
   * @returns {Promise}
   */
  getRequestData: async (requestData) => {
    try {
      const response = await apiClient.post("/getRequestData", requestData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch request data",
      };
    }
  },

  /**
   * Add a new request (follow seller)
   * @param {Object} requestData - Request data
   * @returns {Promise}
   */
  addRequest: async (requestData) => {
    try {
      const response = await apiClient.post("/addRequest", requestData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to send request",
      };
    }
  },

  /**
   * Approve or deny a request
   * @param {Object} actionData - {token, id, decision}
   * @returns {Promise}
   */
  approveOrDenyRequest: async (actionData) => {
    try {
      const response = await apiClient.post("/ApproveOrDeny", actionData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          `Failed to ${actionData.decision.toLowerCase()} request`,
      };
    }
  },
};

export default requestService;
