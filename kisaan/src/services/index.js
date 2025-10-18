import authService from "./authService";
import itemService from "./itemService";
import requestService from "./requestService";
import apiClient from "./api";

// Export individual services
export { authService, itemService, requestService, apiClient };

// Default export with all services
export default {
  auth: authService,
  item: itemService,
  request: requestService,
  api: apiClient,
};
