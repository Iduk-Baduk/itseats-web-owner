import { API_ENDPOINTS } from "../config/api";
import apiClient from "./apiClient";

// 메뉴 API 서비스
export const menuAPI = {
  getMenus: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MENU_LIST());
      return response.data;
    } catch (e) {
      console.error("API Error: getMenus", e);
      throw e;
    }
  },

  getMenu: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_MENU(String(id)));
      return response.data;
    } catch (e) {
      console.error("API Error: getMenu", e);
      throw e;
    }
  },

  getMenuStats: async () => {
    try {
      const response = await apiClient.get("/menuStats");
      return response.data;
    } catch (e) {
      console.error("API Error: getMenuStats", e);
      throw e;
    }
  },

  getOwnerData: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.OWNER);
      // 성공 시 받아온 데이터를 반환합니다.
      return response.data;
    } catch (e) {
      // 에러 발생 시 콘솔에 출력하고 에러를 다시 던져줍니다.
      console.error("API Error: getOwnerData", e);
      throw e;
    }
  },

  addMenu: async (menuData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ADD_MENU(), menuData);
      return response.data;
    } catch (e) {
      console.error("API Error: addMenu", e);
      throw e;
    }
  },

  updateMenu: async (id, menuData) => {
    try {
      console.log("Updating menu:", { id, menuData }); // 디버깅용 로그
      const response = await apiClient.patch(API_ENDPOINTS.UPDATE_MENU(String(id)), menuData);
      return response.data;
    } catch (e) {
      console.error("API Error: updateMenu", e);
      throw e;
    }
  },

  deleteMenu: async (id) => {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.UPDATE_MENU(String(id)));
      return response.data;
    } catch (e) {
      console.error("API Error: deleteMenu", e);
      throw e;
    }
  },
};
