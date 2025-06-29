import { API_ENDPOINTS } from "../config/api";
import apiClient from "./apiClient";

// 메뉴 API 서비스
export const menuAPI = {
  getMenus: async () => {
    const response = await apiClient.get(API_ENDPOINTS.MENUS_BY_ID());
    return response.data;
  },

  getOwnerData: async () => {
    try {
      const response = await apiClient.get("/owner");
      // 성공 시 받아온 데이터를 반환합니다.
      return response.data;
    } catch (e) {
      // 에러 발생 시 콘솔에 출력하고 에러를 다시 던져줍니다.
      console.error("API Error: getOwnerData", e);
      throw e;
    }
  },
};
