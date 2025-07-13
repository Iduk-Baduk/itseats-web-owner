import { add } from "date-fns";

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
  // 사용자 관련
  MEMBERS: {
    LOGIN: () => '/login', // POST (로그인)
    ME: () => '/owner/members/me', // GET (내 정보 조회)
    SIGN_UP: () => '/owner/members/sign-up', // POST (회원가입)
  },
  // 가맹점 관련
  STORES: {
    ADD: () => '/owner/store-regist', // POST (가맹점 추가)
  },
  // 매장 메뉴 관련
  MENUS: {
    LIST_BY_STORE: (storeId) => `/owner/${storeId}/menus`, // GET (매장별 메뉴 목록)
    LIST: () => `/owner/menus`,           // GET (목록)
    ADD: (storeId) => `/owner/${storeId}/menus/new`,        // POST (메뉴 추가)
    DETAIL: (storeId, menuId) => `/owner/${storeId}/menus/${menuId}`, // GET (단일), PUT (수정), DELETE (삭제)
    STATS: () => `/owner/menuStats`,      // GET (통계)
  },
  OWNER: `/owner`,
  // 주문 관련
  ORDERS: {
    LIST: (storeId) => `/owner/${storeId}/orders`,  // GET (주문 목록 조회)
    DETAIL: (orderId) => `/owner/orders/${orderId}`, // GET (주문 상세 조회)
    ACCEPT: (orderId) => `/owner/orders/${orderId}/accept`, // PUT (주문 수락)
    REJECT: (orderId) => `/owner/orders/${orderId}/reject`, // PUT (주문 거절)
    COOKTIME: (orderId) => `/owner/orders/${orderId}/cooktime`, // PUT (예상 조리시간 설정, 조리 시작)
    READY: (orderId) => `/owner/orders/${orderId}/ready`, // POST (조리 완료)
    PAUSE: (storeId) => `/owner/orders/${storeId}/pause`, // POST (주문 일시정지)
    START: (storeId) => `/owner/orders/${storeId}/start`, // POST (주문 재개)
    // 통계 관련
    STATS: {
      DAILY: (storeId) => `/daily_stats/${storeId}`, // GET (일간 통계)
      WEEKLY: (storeId) => `/weekly_stats/${storeId}`, // GET (주간 통계)
      MONTHLY: (storeId) => `/monthly_stats/${storeId}`, // GET (월간 통계)
      SUMMARY: (storeId) => `/stats_summary/${storeId}`, // GET (현재 요약 통계)
    },
  },
};
