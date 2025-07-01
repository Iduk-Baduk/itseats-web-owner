import { API_ENDPOINTS } from "../config/api";
import apiClient from "./apiClient";
import { handleError } from "../utils/errorHandler";
import { useAuth } from "../contexts/AuthContext";

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
    const response = await apiClient.get(`/orders?storeId=${storeId}`);
    // id를 orderId로 매핑
    const orders = response.data.map(order => ({
      ...order,
      orderId: order.id
    }));
    return { data: { orders } };
  }, 'GET_ORDERS'),

  // 주문 상세 조회
  getOrderDetail: withOrderErrorHandling(async (orderId) => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return { ...response.data, orderId: response.data.id };
  }, 'GET_ORDER_DETAIL'),

  // 주문 수락
  acceptOrder: withOrderErrorHandling(async (orderId) => {
    if (!orderId) {
      throw new Error('주문 ID가 필요합니다.');
    }
    const response = await apiClient.patch(`/orders/${orderId}`, {
      status: 'ACCEPTED',
      updatedAt: new Date().toISOString()
    });
    return { data: { success: true, order: { ...response.data, orderId: response.data.id } } };
  }, 'ACCEPT_ORDER'),

  // 주문 거절
  rejectOrder: withOrderErrorHandling(async (orderId, reason) => {
    const response = await apiClient.patch(`/orders/${orderId}`, {
      status: 'REJECTED',
      rejectionReason: reason,
      updatedAt: new Date().toISOString()
    });
    return { data: { success: true, order: { ...response.data, orderId: response.data.id } } };
  }, 'REJECT_ORDER'),

  // 조리 완료 처리
  markOrderAsReady: withOrderErrorHandling(async (orderId) => {
    const response = await apiClient.patch(`/orders/${orderId}`, {
      status: 'READY',
      updatedAt: new Date().toISOString()
    });
    return { data: { success: true, order: { ...response.data, orderId: response.data.id } } };
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
export const fetchOrders = async (storeId) => {
  const response = await apiClient.get(API_ENDPOINTS.ORDERS.LIST(storeId));
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await apiClient.patch(API_ENDPOINTS.ORDERS.DETAIL(orderId), { status });
  return response.data;
};

// 통계 관련 API
export const fetchDailyStats = async (storeId) => {
  if (!storeId) {
    throw new Error('매장 ID가 필요합니다.');
  }
  const response = await apiClient.get(`/daily_stats?id=${storeId}`);
  return response.data[0] || {
    totalOrders: 0,
    totalSales: 0,
    averageOrderAmount: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    topMenus: []
  };
};

export const fetchWeeklyStats = async (storeId) => {
  if (!storeId) {
    throw new Error('매장 ID가 필요합니다.');
  }
  const response = await apiClient.get(API_ENDPOINTS.ORDERS.STATS.WEEKLY(storeId));
  return response.data;
};

export const fetchMonthlyStats = async (storeId) => {
  if (!storeId) {
    throw new Error('매장 ID가 필요합니다.');
  }
  const response = await apiClient.get(API_ENDPOINTS.ORDERS.STATS.MONTHLY(storeId));
  return response.data;
};

export const fetchTopMenus = async (storeId) => {
  if (!storeId) {
    throw new Error('매장 ID가 필요합니다.');
  }
  const response = await apiClient.get(`/stats_summary?id=${storeId}`);
  const summary = response.data[0] || { topMenus: [] };
  return summary.topMenus;
}; 
