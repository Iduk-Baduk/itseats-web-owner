import { API_ENDPOINTS } from "../config/api";
import apiClient from "./apiClient";
import { handleError } from "../utils/errorHandler";
import { useAuth } from "../contexts/AuthContext";
import { ORDER_STATUS } from '../constants/orderTypes';

// 에러 처리 래퍼
const withOrderErrorHandling = (fn, actionType) => async (...args) => {
  try {
    return await fn(...args);
  } catch (error) {
    console.error(`Error in ORDER_${actionType}:`, error);
    throw error;
  }
};

// 주문 API 서비스
export const orderAPI = {
  // 주문 목록 조회
  getOrders: withOrderErrorHandling(async (storeId) => {
    const response = await apiClient.get(API_ENDPOINTS.ORDERS.LIST(storeId));
    // id를 orderId로 매핑
    const orders = Array.isArray(response.data) ? response.data : [];
    return { 
      data: { 
        orders: orders.map(order => ({
      ...order,
      orderId: order.id
        }))
      } 
    };
  }, 'GET_ORDERS'),

  // 주문 상세 조회
  getOrderDetail: withOrderErrorHandling(async (orderId) => {
    const response = await apiClient.get(API_ENDPOINTS.ORDERS.DETAIL(orderId));
    return { data: { ...response.data, orderId: response.data.id } };
  }, 'GET_ORDER_DETAIL'),

  // 주문 상태 변경 (통합 메서드)
  updateOrderStatus: withOrderErrorHandling(async (orderId, status) => {
    if (!orderId) {
      throw new Error('주문 ID가 필요합니다.');
    }
    const response = await apiClient.patch(API_ENDPOINTS.ORDERS.DETAIL(orderId), {
      status: status,
      updatedAt: new Date().toISOString()
    });
    return { 
      data: { 
        success: true, 
        order: { ...response.data, orderId: response.data.id } 
      } 
    };
  }, 'UPDATE_STATUS'),

  // 주문 수락
  acceptOrder: async (orderId) => {
    return orderAPI.updateOrderStatus(orderId, ORDER_STATUS.ACCEPTED);
  },

  // 주문 거절
  rejectOrder: async (orderId) => {
    return orderAPI.updateOrderStatus(orderId, ORDER_STATUS.REJECTED);
  },

  // 조리 완료 처리
  markOrderAsReady: async (orderId) => {
    return orderAPI.updateOrderStatus(orderId, ORDER_STATUS.READY);
  },

  // 예상 조리 시간 설정
  setCookTime: withOrderErrorHandling(async (orderId, cookTimeMinutes) => {
    if (!cookTimeMinutes || cookTimeMinutes <= 0) {
      throw new Error('유효한 조리 시간을 입력해주세요.');
    }
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

  // 배차 신청
  requestDelivery: async (orderId) => {
    return orderAPI.updateOrderStatus(orderId, ORDER_STATUS.DELIVERY_REQUESTED);
  },

  // 배차 완료
  assignDelivery: async (orderId) => {
    return orderAPI.updateOrderStatus(orderId, ORDER_STATUS.DELIVERY_ASSIGNED);
  },

  // 배달 완료
  completeDelivery: async (orderId) => {
    return orderAPI.updateOrderStatus(orderId, ORDER_STATUS.COMPLETED);
  }
};

// 주문 관련 API
export const fetchOrders = async (storeId) => {
  const response = await apiClient.get(API_ENDPOINTS.ORDERS.LIST(storeId));
  return response.data;
};

// 통계 관련 API
export const fetchDailyStats = async (storeId) => {
  if (!storeId) {
    throw new Error('매장 ID가 필요합니다.');
  }

  // 오늘 날짜의 시작과 끝
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 모든 주문 데이터 조회
  const response = await apiClient.get(`/orders?storeId=${storeId}`);
  const orders = response.data;

  // 오늘의 주문만 필터링
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= today && orderDate < tomorrow;
  });

  // 상태별 주문 수 계산
  const pendingOrders = todayOrders.filter(order => order.status === 'PENDING').length;
  const processingOrders = todayOrders.filter(order => order.status === 'ACCEPTED').length;
  const completedOrders = todayOrders.filter(order => order.status === 'READY').length;

  // 총 매출액 계산 (READY 상태의 주문만)
  const completedOrdersData = todayOrders.filter(order => order.status === 'READY');
  const totalSales = completedOrdersData.reduce((sum, order) => sum + order.totalAmount, 0);

  // 평균 주문금액 계산
  const averageOrderAmount = completedOrdersData.length > 0
    ? Math.round(totalSales / completedOrdersData.length)
    : 0;

  return {
    totalOrders: todayOrders.length,
    totalSales,
    averageOrderAmount,
    pendingOrders,
    processingOrders,
    completedOrders
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

  // 오늘 날짜의 시작과 끝
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 모든 주문 데이터 조회
  const response = await apiClient.get(`/orders?storeId=${storeId}`);
  const orders = response.data;

  // 오늘의 완료된 주문만 필터링
  const completedOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= today && orderDate < tomorrow && order.status === 'READY';
  });

  // 메뉴별 주문 횟수 집계
  const menuCounts = {};
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      const menuId = item.menuId;
      const menuName = item.name;
      if (!menuCounts[menuId]) {
        menuCounts[menuId] = {
          id: menuId,
          name: menuName,
          orderCount: 0
        };
      }
      menuCounts[menuId].orderCount += item.quantity;
    });
  });

  // 상위 5개 메뉴 추출
  const topMenus = Object.values(menuCounts)
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 5);

  return topMenus;
}; 
