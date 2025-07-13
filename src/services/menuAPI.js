import { API_ENDPOINTS } from "../config/api";
import apiClient from "./apiClient";

// ID 처리를 위한 헬퍼 함수
const getMenuId = (menu) => menu?.id || menu?.menuId;

const findMenuById = (menus, targetId) => {
  return menus.find(menu => {
    const menuId = getMenuId(menu);
    return String(menuId) === String(targetId);
  });
};

// 메뉴 API 서비스
export const menuAPI = {
  getMenusByStoreId: async (storeId) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.MENUS.LIST_BY_STORE(String(storeId)), {});
      return response.data;
    } catch (e) {
      console.error("API Error: getMenusByStoreId", e);
      throw e;
    }
  },

  getMenus: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MENUS.LIST());
      return response.data;
    } catch (e) {
      console.error("API Error: getMenus", e);
      throw e;
    }
  },

  getMenu: async (storeId, menuId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MENUS.DETAIL(storeId, menuId));
      return response.data;
    } catch (e) {
      console.error("API Error: getMenu", e);
      throw e;
    }
  },

  getMenuStats: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MENUS.STATS());
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

  addMenu: async (storeId, menuData) => {
    try {
      const form = new FormData();
      form.append("request", new Blob(
        [JSON.stringify(menuData)],
        { type: "application/json" }
      ));

      const response = await apiClient.post(API_ENDPOINTS.MENUS.ADD(storeId), form);
      return response.data;
    } catch (e) {
      console.error("API Error: addMenu", e);
      throw e;
    }
  },

  updateMenu: async (storeId, menuId , menuData) => {
    try {
      console.log("Updating menu:", { storeId, menuId, menuData }); // 디버깅용 로그

      const form = new FormData();
      form.append("request", new Blob(
        [JSON.stringify(menuData)],
        { type: "application/json" }
      ));

      const response = await apiClient.put(API_ENDPOINTS.MENUS.DETAIL(storeId, menuId), form);
      return response.data;
    } catch (e) {
      console.error("API Error: updateMenu", e);
      throw e;
    }
  },

  updateMenuStatus: async (storeId, menuId, status) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MENUS.DETAIL(storeId, menuId));
      const menuData = response.data;

      menuData.menuStatus = status;
      const form = new FormData();
      form.append("request", new Blob(
        [JSON.stringify(menuData)],
        { type: "application/json" }
      ));

      const updateResponse = await apiClient.put(API_ENDPOINTS.MENUS.DETAIL(storeId, menuId), form);
      return updateResponse.data;
    } catch (e) {
      console.error("API Error: updateMenuStatus", e);
      throw e;
    }
  },

  deleteMenu: async (storeId, menuId) => {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.MENUS.DETAIL(storeId, menuId));
      return response.data;
    } catch (e) {
      console.error("API Error: deleteMenu", e);
      throw e;
    }
  },
};
