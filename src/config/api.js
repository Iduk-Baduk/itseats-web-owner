const getEnvVar = (key, defaultValue) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || defaultValue;
  }
  return defaultValue;
};

export const API_CONFIG = {
  BASE_URL: getEnvVar('VITE_API_URL', "http://localhost:3001"),
  TIMEOUT: parseInt(getEnvVar('VITE_TIMEOUT', "10000")),
};

export const API_ENDPOINTS = {
  // 매장 메뉴 관련
  MENUS: {
    LIST: () => `/menus`,           // GET (목록), POST (생성)
    DETAIL: (id) => `/menus/${id}`, // GET (단일), PATCH (수정), DELETE (삭제)
    STATS: () => `/menuStats`,      // GET (통계)
  },
  OWNER: `/owner`,
  // 주문 관련
  ORDERS: {
    LIST: (storeId) => `/api/owner/${storeId}/orders`,  // GET (주문 목록 조회)
    DETAIL: (orderId) => `/api/owner/orders/${orderId}`, // GET (주문 상세 조회)
    ACCEPT: (orderId) => `/api/owner/orders/${orderId}/accept`, // POST (주문 수락)
    REJECT: (orderId) => `/api/owner/orders/${orderId}/reject`, // POST (주문 거절)
    READY: (orderId) => `/api/owner/orders/${orderId}/ready`, // POST (조리 완료)
    COOKTIME: (orderId) => `/api/owner/orders/${orderId}/cooktime`, // POST (예상 조리시간 설정)
    PAUSE: (storeId) => `/api/owner/${storeId}/pause`, // POST (주문 일시정지)
    START: (storeId) => `/api/owner/${storeId}/start`, // POST (주문 재개)
    // 통계 관련
    STATS: {
      DAILY: (storeId) => `/api/owner/${storeId}/stats/daily`, // GET (일간 통계)
      WEEKLY: (storeId) => `/api/owner/${storeId}/stats/weekly`, // GET (주간 통계)
      MONTHLY: (storeId) => `/api/owner/${storeId}/stats/monthly`, // GET (월간 통계)
      SUMMARY: (storeId) => `/api/owner/${storeId}/stats/summary`, // GET (현재 요약 통계)
    },
  },
};
