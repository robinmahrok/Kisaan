import apiClient from "./api";

const itemService = {
  /**
   * Get all items for the authenticated user
   * Token is automatically sent in headers by apiClient
   * @returns {Promise}
   */
  getAllItems: async () => {
    try {
      const response = await apiClient.get("/allItems");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch items",
      };
    }
  },

  /**
   * Get items list with filters and pagination
   * @param {Object} params - Filter and pagination parameters
   * @returns {Promise}
   */
  getItemsList: async (params) => {
    try {
      const response = await apiClient.post("/getItemsList", params);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch products",
      };
    }
  },

  /**
   * Edit/Update an item
   * @param {Object} itemData - Item data to update
   * @returns {Promise}
   */
  editItem: async (itemData) => {
    try {
      const response = await apiClient.post("/editItems", itemData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update item",
      };
    }
  },

  /**
   * Delete an item
   * @param {Object} deleteData - {token, id}
   * @returns {Promise}
   */
  deleteItem: async (deleteData) => {
    try {
      const response = await apiClient.post("/deleteItems", deleteData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to delete item",
      };
    }
  },

  /**
   * Add seller data/product
   * @param {Object} sellerData - Seller product data
   * @returns {Promise}
   */
  addSellerData: async (sellerData) => {
    try {
      const response = await apiClient.post("/addSellerData", sellerData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to add product",
      };
    }
  },

  /**
   * Get products (product varieties)
   * Token is automatically sent in headers by apiClient
   * @returns {Promise}
   */
  getProducts: async () => {
    try {
      const response = await apiClient.post("/products", {});
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch products",
      };
    }
  },

  /**
   * Upload file (image)
   * Note: This uses FormData and fetch instead of axios
   * @param {FormData} formData - Form data with file
   * @returns {Promise}
   */
  uploadFile: async (formData) => {
    try {
      const baseUrl = apiClient.defaults.baseURL;
      const response = await fetch(`${baseUrl}/uploadFile`, {
        method: "POST",
        body: formData,
      });

      if (response.status === 200) {
        return {
          success: true,
          data: await response.json(),
        };
      } else {
        return {
          success: false,
          error: "Could not upload the image",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to upload file",
      };
    }
  },
};

export default itemService;
