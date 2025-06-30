export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  TIMEOUT: parseInt(import.meta.env.VITE_TIMEOUT) || 10000,
};

export const API_ENDPOINTS = {
  // 매장 메뉴 관련
  //   MENUS_BY_ID: (id) => `/api/owner/${store_id}/menus`,
  MENU_LIST: () => `/menus`,  // GET, POST 요청 모두 사용
  ADD_MENU: () => `/menus`,  // POST 요청용
  OWNER: `/owner`,
};
