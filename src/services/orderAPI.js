import { API_ENDPOINTS } from "../config/api";
import apiClient from "./apiClient";
import { handleError } from "../utils/errorHandler";

// 에러 처리 래퍼
const withOrderErrorHandling = (fn, operationName) => async (...args) => {
  try {
    return await fn(...args);
  } catch (error) {
    handleError(error, {
      showToast: true,
      context: `ORDER_${operationName}`
    });
    throw error;
  }
};

// 주문 API 서비스
export const orderAPI = {
  // 주문 목록 조회
  getOrders: withOrderErrorHandling(async (storeId) => {
    const response = await apiClient.get(API_ENDPOINTS.ORDERS.LIST(storeId));
    return response.data;
  }, 'GET_ORDERS'),

  // 주문 상세 조회
  getOrderDetail: withOrderErrorHandling(async (orderId) => {
    const response = await apiClient.get(API_ENDPOINTS.ORDERS.DETAIL(orderId));
    return response.data;
  }, 'GET_ORDER_DETAIL'),

  // 주문 수락
  acceptOrder: withOrderErrorHandling(async (orderId) => {
    const response = await apiClient.post(API_ENDPOINTS.ORDERS.ACCEPT(orderId));
    return response.data;
  }, 'ACCEPT_ORDER'),

  // 주문 거절
  rejectOrder: withOrderErrorHandling(async (orderId, reason) => {
    const response = await apiClient.post(API_ENDPOINTS.ORDERS.REJECT(orderId), { reason });
    return response.data;
  }, 'REJECT_ORDER'),

  // 조리 완료 처리
  markOrderAsReady: withOrderErrorHandling(async (orderId) => {
    const response = await apiClient.post(API_ENDPOINTS.ORDERS.READY(orderId));
    return response.data;
  }, 'MARK_ORDER_READY'),

  // 예상 조리 시간 설정
  setCookTime: withOrderErrorHandling(async (orderId, cookTimeMinutes) => {
    const response = await apiClient.post(API_ENDPOINTS.ORDERS.COOKTIME(orderId), { 
      cookTimeMinutes 
    });
    return response.data;
  }, 'SET_COOK_TIME'),

  // 주문 일시정지
  pauseOrders: withOrderErrorHandling(async (storeId, pauseDurationMinutes) => {
    const response = await apiClient.post(API_ENDPOINTS.ORDERS.PAUSE(storeId), { 
      pauseDurationMinutes 
    });
    return response.data;
  }, 'PAUSE_ORDERS'),

  // 주문 재개
  startOrders: withOrderErrorHandling(async (storeId) => {
    const response = await apiClient.post(API_ENDPOINTS.ORDERS.START(storeId));
    return response.data;
  }, 'START_ORDERS'),

  // 일간 통계 조회
  getDailyStats: withOrderErrorHandling(async (storeId, date) => {
    const params = date ? { date: date.toISOString().split('T')[0] } : {};
    const response = await apiClient.get(API_ENDPOINTS.ORDERS.STATS.DAILY(storeId), { params });
    return response.data;
  }, 'GET_DAILY_STATS'),

  // 주간 통계 조회
  getWeeklyStats: withOrderErrorHandling(async (storeId, startDate) => {
    const params = startDate ? { startDate: startDate.toISOString().split('T')[0] } : {};
    const response = await apiClient.get(API_ENDPOINTS.ORDERS.STATS.WEEKLY(storeId), { params });
    return response.data;
  }, 'GET_WEEKLY_STATS'),

  // 월간 통계 조회
  getMonthlyStats: withOrderErrorHandling(async (storeId, year, month) => {
    const params = year && month ? { year, month } : {};
    const response = await apiClient.get(API_ENDPOINTS.ORDERS.STATS.MONTHLY(storeId), { params });
    return response.data;
  }, 'GET_MONTHLY_STATS'),

  // 현재 요약 통계 조회
  getStatsSummary: withOrderErrorHandling(async (storeId) => {
    const response = await apiClient.get(API_ENDPOINTS.ORDERS.STATS.SUMMARY(storeId));
    return response.data;
  }, 'GET_STATS_SUMMARY'),
};

// 주문 관련 API
export const fetchOrders = async (params) => {
  const response = await apiClient.get('/orders', { params });
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await apiClient.patch(`/orders/${orderId}/status`, { status });
  return response.data;
};

// 통계 관련 API
export const fetchDailyStats = async () => {
  const response = await apiClient.get('/orders/stats/daily');
  return response.data;
};

export const fetchWeeklyStats = async () => {
  const response = await apiClient.get('/orders/stats/weekly');
  return response.data;
};

export const fetchMonthlyStats = async () => {
  const response = await apiClient.get('/orders/stats/monthly');
  return response.data;
};

export const fetchTopMenus = async (params) => {
  const response = await apiClient.get('/orders/stats/top-menus', { params });
  return response.data;
}; 
