export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  TIMEOUT: parseInt(import.meta.env.VITE_TIMEOUT) || 10000,
};

export const API_ENDPOINTS = {
  // 매장 메뉴 관련
  MENUS: {
    LIST: () => `/menus`,           // GET (목록), POST (생성)
    DETAIL: (id) => `/menus/${id}`, // GET (단일), PATCH (수정), DELETE (삭제)
    STATS: () => `/menuStats`,      // GET (통계)
  },
  OWNER: `/owner`,
};
