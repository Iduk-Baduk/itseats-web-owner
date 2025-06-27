import { API_ENDPOINTS } from "../config/api";
import apiClient from "./apiClient";

// 메뉴 API 서비스
export const menuAPI = {
  getMenus: async () => {
    const response = await apiClient.get(API_ENDPOINTS.MENUS_BY_ID());
    return response.data;
  },
};
