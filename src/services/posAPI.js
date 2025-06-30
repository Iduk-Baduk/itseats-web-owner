import apiClient from './apiClient';
import { withErrorHandling, retryApiCall, handleError } from '../utils/errorHandler';
import { toISOString } from '../utils/dateUtils';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1초

// ISO 8601 형식 검증을 위한 정규식
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

// 타임스탬프 정규화 함수
const normalizeTimestamp = (timestamp) => {
  if (!timestamp) return new Date().toISOString();
  return ISO_DATE_REGEX.test(timestamp) ? timestamp : new Date(timestamp).toISOString();
};

// 고유 ID 생성 헬퍼
const generateId = () => 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

// 데이터베이스 타임스탬프 형식 수정 함수
const fixDatabaseTimestamps = async () => {
  try {
    const currentData = await apiClient.get('/pos');
    let needsUpdate = false;

    // lastUpdated 필드 검증
    if (currentData.data.lastUpdated) {
      const fixedLastUpdated = normalizeTimestamp(currentData.data.lastUpdated);
      if (fixedLastUpdated !== currentData.data.lastUpdated) {
        currentData.data.lastUpdated = fixedLastUpdated;
        needsUpdate = true;
      }
    }

    // statusHistory 타임스탬프 검증
    if (currentData.data.statusHistory) {
      currentData.data.statusHistory = currentData.data.statusHistory.map(item => {
        const fixedTimestamp = normalizeTimestamp(item.timestamp);
        const fixedApprovedAt = item.approvedAt ? normalizeTimestamp(item.approvedAt) : null;
        
        if (fixedTimestamp !== item.timestamp || fixedApprovedAt !== item.approvedAt) {
          needsUpdate = true;
          return {
            ...item,
            timestamp: fixedTimestamp,
            approvedAt: fixedApprovedAt
          };
        }
        return item;
      });
    }

    // notifications 타임스탬프 검증
    if (currentData.data.notifications) {
      currentData.data.notifications = currentData.data.notifications.map(item => {
        const fixedTimestamp = normalizeTimestamp(item.timestamp);
        if (fixedTimestamp !== item.timestamp) {
          needsUpdate = true;
          return {
            ...item,
            timestamp: fixedTimestamp
          };
        }
        return item;
      });
    }

    // 변경된 내용이 있으면 업데이트
    if (needsUpdate) {
      await apiClient.put('/pos', currentData.data);
      console.log('Database timestamps have been fixed');
    }
  } catch (error) {
    console.error('Failed to fix database timestamps:', error);
  }
};

export class ConcurrencyError extends Error {
  constructor(message = '다른 사용자가 이미 상태를 변경했습니다. 새로고침 후 다시 시도해주세요.') {
    super(message);
    this.name = 'ConcurrencyError';
  }
}

export class TransactionError extends Error {
  constructor(message = '처리 중 오류가 발생했습니다. 관리자에게 문의해주세요.') {
    super(message);
    this.name = 'TransactionError';
  }
}

// 에러 처리를 포함한 API 호출 래퍼
const withErrorHandling = (fn, operationName) => async (...args) => {
  try {
    return await fn(...args);
  } catch (error) {
    if (error instanceof ConcurrencyError || error instanceof TransactionError) {
      throw error;
    }
    handleError(error, {
      showToast: true,
      context: operationName
    });
    throw error;
  }
};

// 낙관적 잠금을 포함한 데이터 업데이트 헬퍼
const updatePosData = async (posId, updateFn) => {
  const currentData = await apiClient.get(`/pos/${posId}`);
  const { version } = currentData.data;

  try {
    const updatedData = updateFn(currentData.data);
    const response = await apiClient.put(`/pos/${posId}`, {
      ...updatedData,
      version
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      throw new ConcurrencyError();
    }
    throw error;
  }
};

// 트랜잭션 처리를 포함한 데이터 업데이트 헬퍼
const updatePosDataWithTransaction = async (posId, updateFn) => {
  try {
    const currentData = await apiClient.get(`/pos/${posId}`);
    const updatedData = updateFn(currentData.data);
    
    const response = await apiClient.post(`/pos/${posId}/transaction`, {
      data: updatedData,
      timestamp: normalizeTimestamp(new Date().toISOString())
    });
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      throw new ConcurrencyError();
    }
    if (error.response?.status === 500) {
      throw new TransactionError();
    }
    throw error;
  }
};

// API 메서드들
export const getPosStatus = withErrorHandling(
  async (posId) => {
    const response = await apiClient.get(`/pos/${posId}`);
    return response.data;
  },
  'getPosStatus'
);

export const updatePosStatus = withErrorHandling(
  async (posId, statusData) => {
    return updatePosDataWithTransaction(posId, (currentData) => ({
      ...currentData,
      status: statusData.status,
      statusMetadata: {
        ...statusData,
        timestamp: toISOString(statusData.timestamp)
      }
    }));
  },
  'updatePosStatus'
);

export const updatePosSettings = withErrorHandling(
  async (posId, settings) => {
    return updatePosData(posId, (currentData) => ({
      ...currentData,
      settings: {
        ...currentData.settings,
        ...settings,
        updatedAt: toISOString(settings.updatedAt)
      }
    }));
  },
  'updatePosSettings'
);

export const updatePosAutoSettings = withErrorHandling(
  async (posId, autoSettings) => {
    return updatePosData(posId, (currentData) => ({
      ...currentData,
      autoSettings: {
        ...currentData.autoSettings,
        ...autoSettings,
        updatedAt: toISOString(autoSettings.updatedAt)
      }
    }));
  },
  'updatePosAutoSettings'
);

export const getPosStatusHistory = withErrorHandling(
  async (posId, params = {}) => {
    const response = await apiClient.get(`/pos/${posId}/history`, { params });
    return response.data;
  },
  'getPosStatusHistory'
);

export const retryFailedTransaction = withErrorHandling(
  async (transactionId) => {
    const response = await apiClient.post(`/transactions/${transactionId}/retry`);
    return response.data;
  },
  'retryFailedTransaction'
);

const posAPI = {
  // POS 상태 조회 (타임스탬프 형식 검증 추가)
  getPosStatus: withErrorHandling(async () => {
    const response = await apiClient.get('/pos');
    await fixDatabaseTimestamps(); // 데이터베이스 타임스탬프 검증
    return { status: response.data.currentStatus };
  }, 'getPosStatus'),

  // POS 상태 업데이트 (확장된 메타데이터 포함)
  updatePosStatus: withErrorHandling(async (status, metadata = {}) => {
    // 전체 데이터 조회 후 상태만 업데이트
    const currentData = await apiClient.get('/pos');
    const timestamp = normalizeTimestamp(new Date().toISOString());
    
    // 새로운 히스토리 항목 생성
    const newHistoryItem = {
      id: generateId(),
      status: status,
      timestamp: timestamp,
      reason: metadata.reason || '사유 없음',
      userId: metadata.userId || 'system',
      userName: metadata.userName || '시스템',
      notes: metadata.notes || '',
      estimatedRevenueLoss: metadata.estimatedRevenueLoss || 0,
      affectedOrderCount: metadata.affectedOrderCount || 0,
      category: metadata.category || 'MANUAL',
      requiresApproval: metadata.requiresApproval || false,
      approvedBy: metadata.approvedBy || null,
      approvedAt: metadata.approvedAt ? normalizeTimestamp(metadata.approvedAt) : null
    };

    // 기존 히스토리의 타임스탬프 형식 수정
    const updatedHistory = currentData.data.statusHistory.map(item => ({
      ...item,
      timestamp: normalizeTimestamp(item.timestamp),
      approvedAt: item.approvedAt ? normalizeTimestamp(item.approvedAt) : null
    }));

    const updatedData = {
      ...currentData.data,
      currentStatus: status,
      lastUpdated: timestamp,
      statusHistory: [
        newHistoryItem,
        ...updatedHistory
      ]
    };
    
    // 분석 데이터 업데이트
    if (updatedData.analytics) {
      updatedData.analytics.todayStatusChanges = (updatedData.analytics.todayStatusChanges || 0) + 1;
      
      // 매출 손실 누적
      if (newHistoryItem.estimatedRevenueLoss > 0) {
        updatedData.analytics.totalRevenueLossThisWeek = 
          (updatedData.analytics.totalRevenueLossThisWeek || 0) + newHistoryItem.estimatedRevenueLoss;
      }
      
      // 가장 빈번한 사유 업데이트 (간단한 구현)
      updatedData.analytics.mostFrequentReason = newHistoryItem.reason;
    }
    
    const response = await apiClient.put('/pos', updatedData);
    
    // 알림 생성
    await posAPI.createNotification({
      type: 'STATUS_CHANGE',
      title: 'POS 상태 변경',
      message: `매장이 '${newHistoryItem.reason}'으로 인해 '${status}' 상태로 변경되었습니다.`,
      severity: status === 'CLOSED' ? 'WARNING' : 'INFO',
      relatedStatusChangeId: newHistoryItem.id
    });
    
    return response.data;
  }, 'updatePosStatus'),

  // POS 설정 조회
  getPosSettings: withErrorHandling(async () => {
    const response = await apiClient.get('/pos');
    return response.data.settings;
  }, 'getPosSettings'),

  // POS 설정 업데이트
  updatePosSettings: withErrorHandling(async (settings) => {
    // 전체 데이터 조회 후 설정만 업데이트
    const currentData = await apiClient.get('/pos');
    const updatedData = {
      ...currentData.data,
      settings: {
        ...currentData.data.settings,
        ...settings
      }
    };
    
    const response = await apiClient.put('/pos', updatedData);
    return response.data;
  }, 'updatePosSettings'),

  // POS 상태 히스토리 조회 (확장된 필터링)
  getPosStatusHistory: withErrorHandling(async ({ 
    startDate, 
    endDate, 
    status, 
    category, 
    userId 
  } = {}) => {
    const response = await apiClient.get('/pos');
    
    let statusHistory = response.data.statusHistory || [];
    
    // 다양한 필터링 적용
    statusHistory = statusHistory.filter(item => {
      // 날짜 필터링
      if (startDate || endDate) {
        const itemDate = new Date(item.timestamp);
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        if (!(itemDate >= start && itemDate <= end)) {
          return false;
        }
      }
      
      // 상태 필터링
      if (status && item.status !== status) {
        return false;
      }
      
      // 카테고리 필터링
      if (category && item.category !== category) {
        return false;
      }
      
      // 사용자 필터링
      if (userId && item.userId !== userId) {
        return false;
      }
      
      return true;
    });
    
    // 응답 데이터의 상태 히스토리를 시간순(내림차순)으로 정렬
    statusHistory.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return { history: statusHistory };
  }, 'getPosStatusHistory'),

  // POS 자동화 설정 조회
  getPosAutoSettings: withErrorHandling(async () => {
    const response = await apiClient.get('/pos');
    return response.data.settings;
  }, 'getPosAutoSettings'),

  // POS 자동화 설정 업데이트
  updatePosAutoSettings: withErrorHandling(async (settings) => {
    // 전체 데이터 조회 후 설정만 업데이트
    const currentData = await apiClient.get('/pos');
    const updatedData = {
      ...currentData.data,
      settings: {
        ...currentData.data.settings,
        ...settings
      }
    };
    
    const response = await apiClient.put('/pos', updatedData);
    return response.data;
  }, 'updatePosAutoSettings'),

  // 분석 데이터 조회
  getPosAnalytics: withErrorHandling(async () => {
    const response = await apiClient.get('/pos');
    return response.data.analytics || {};
  }, 'getPosAnalytics'),

  // 알림 생성
  createNotification: withErrorHandling(async (notificationData) => {
    const newNotification = {
      id: generateId(),
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      timestamp: normalizeTimestamp(new Date().toISOString()),
      isRead: false,
      severity: notificationData.severity || 'INFO',
      relatedStatusChangeId: notificationData.relatedStatusChangeId || null
    };

    // 현재 알림 목록 조회
    const currentData = await apiClient.get('/pos');
    
    // 기존 알림의 타임스탬프 형식 수정
    const updatedNotifications = currentData.data.notifications 
      ? currentData.data.notifications.map(notification => ({
          ...notification,
          timestamp: normalizeTimestamp(notification.timestamp)
        }))
      : [];
    
    // notifications 배열이 없으면 새로 생성
    const updatedData = {
      ...currentData.data,
      notifications: [newNotification, ...updatedNotifications]
    };
    
    await apiClient.put('/pos', updatedData);

    return newNotification;
  }, 'createNotification'),

  // 알림 목록 조회
  getNotifications: withErrorHandling(async ({ unreadOnly = false } = {}) => {
    const response = await apiClient.get('/pos');
    const notifications = response.data.notifications || [];
    
    if (unreadOnly) {
      return notifications.filter(notif => !notif.isRead);
    }
    
    return notifications;
  }, 'getNotifications'),

  // 알림 읽음 처리
  markNotificationAsRead: withErrorHandling(async (notificationId) => {
    const currentData = await apiClient.get('/pos');
    const notifications = currentData.data.notifications || [];
    
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId 
        ? { ...notif, isRead: true }
        : notif
    );

    const updatedData = {
      ...currentData.data,
      notifications: updatedNotifications
    };
    
    await apiClient.put('/pos', updatedData);
    return true;
  }, 'markNotificationAsRead'),

  // 모든 알림 읽음 처리
  markAllNotificationsAsRead: withErrorHandling(async () => {
    const currentData = await apiClient.get('/pos');
    const notifications = currentData.data.notifications || [];
    
    const updatedNotifications = notifications.map(notif => ({
      ...notif,
      isRead: true
    }));

    const updatedData = {
      ...currentData.data,
      notifications: updatedNotifications
    };
    
    await apiClient.put('/pos', updatedData);
    return true;
  }, 'markAllNotificationsAsRead')
};

export default posAPI; 
