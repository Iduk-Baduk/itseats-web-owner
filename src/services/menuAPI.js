import { API_ENDPOINTS } from "../config/api";

// 메누 API 서비스
export const menuAPI = {
  getOrders: async (storeId) => {
    return await apiClient.get(API_ENDPOINTS.MENUS_BY_ID(storeId));
  },
};
