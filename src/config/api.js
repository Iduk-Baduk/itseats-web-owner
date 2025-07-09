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
    LIST: () => `/menus`,           // GET (목록), POST (생성)
    DETAIL: (id) => `/menus/${id}`, // GET (단일), PATCH (수정), DELETE (삭제)
    STATS: () => `/menuStats`,      // GET (통계)
  },
  OWNER: `/owner`,
  // 주문 관련
  ORDERS: {
    LIST: (storeId) => `/orders?storeId=${storeId}`,  // GET (주문 목록 조회)
    DETAIL: (orderId) => `/orders/${orderId}`, // GET (주문 상세 조회)
    ACCEPT: (orderId) => `/orders/${orderId}/accept`, // POST (주문 수락)
    REJECT: (orderId) => `/orders/${orderId}/reject`, // POST (주문 거절)
    READY: (orderId) => `/orders/${orderId}/ready`, // POST (조리 완료)
    COOKTIME: (orderId) => `/orders/${orderId}/cooktime`, // POST (예상 조리시간 설정)
    PAUSE: (storeId) => `/orders/${storeId}/pause`, // POST (주문 일시정지)
    START: (storeId) => `/orders/${storeId}/start`, // POST (주문 재개)
    // 통계 관련
    STATS: {
      DAILY: (storeId) => `/daily_stats/${storeId}`, // GET (일간 통계)
      WEEKLY: (storeId) => `/weekly_stats/${storeId}`, // GET (주간 통계)
      MONTHLY: (storeId) => `/monthly_stats/${storeId}`, // GET (월간 통계)
      SUMMARY: (storeId) => `/stats_summary/${storeId}`, // GET (현재 요약 통계)
    },
  },
};
