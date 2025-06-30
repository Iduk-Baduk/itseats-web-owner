import apiClient from './apiClient';
import { retryApiCall, handleError } from '../utils/errorHandler';
import { format } from 'date-fns';
import { toISOString } from '../utils/dateUtils';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1초

// 타임스탬프 처리를 위한 유틸리티 함수들
const dateUtils = {
  toDate: (timestamp) => {
    if (!timestamp) return new Date();
    return new Date(timestamp);
  },

  toISOString: (timestamp) => {
    return dateUtils.toDate(timestamp).toISOString();
  },

  format: (timestamp, formatStr = 'yyyy-MM-dd HH:mm:ss') => {
    return format(dateUtils.toDate(timestamp), formatStr);
  }
};

// 고유 ID 생성 헬퍼
const generateId = () => 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

// 타임스탬프 마이그레이션 상태 확인
const checkTimestampMigrationNeeded = async () => {
  try {
    const response = await apiClient.get('/pos');
    const data = response.data;
    
    // 마이그레이션이 필요한지 빠르게 확인
    const needsMigration = [
      data.lastUpdated,
      ...(data.statusHistory || []).map(item => item.timestamp),
      ...(data.notifications || []).map(item => item.timestamp)
    ].some(timestamp => timestamp && !dateUtils.toDate(timestamp).toISOString().includes('T'));

    return needsMigration;
  } catch (error) {
    console.error('Failed to check timestamp migration status:', error);
    return false;
  }
};

// 데이터베이스 타임스탬프 형식 수정 함수
const fixDatabaseTimestamps = async () => {
  try {
    const currentData = await apiClient.get('/pos');
    let needsUpdate = false;
    const updates = { ...currentData.data };

    // lastUpdated 필드 검증
    if (updates.lastUpdated) {
      const fixedLastUpdated = dateUtils.toISOString(updates.lastUpdated);
      if (fixedLastUpdated !== updates.lastUpdated) {
        updates.lastUpdated = fixedLastUpdated;
        needsUpdate = true;
      }
    }

    // statusHistory 타임스탬프 검증 - 배치 처리
    if (updates.statusHistory?.length) {
      const fixedHistory = updates.statusHistory.map(item => {
        const fixedTimestamp = dateUtils.toISOString(item.timestamp);
        const fixedApprovedAt = item.approvedAt ? dateUtils.toISOString(item.approvedAt) : null;

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

      if (needsUpdate) {
        updates.statusHistory = fixedHistory;
      }
    }

    // notifications 타임스탬프 검증 - 배치 처리
    if (updates.notifications?.length) {
      const fixedNotifications = updates.notifications.map(item => {
        const fixedTimestamp = dateUtils.toISOString(item.timestamp);
        if (fixedTimestamp !== item.timestamp) {
          needsUpdate = true;
          return {
            ...item,
            timestamp: fixedTimestamp
          };
        }
        return item;
      });

      if (needsUpdate) {
        updates.notifications = fixedNotifications;
      }
    }

    // 변경된 내용이 있을 때만 업데이트 수행
    if (needsUpdate) {
      await apiClient.put('/pos', updates);
      console.log('Database timestamps have been normalized');
      
      // 마이그레이션 완료 표시 저장
      try {
        await apiClient.post('/pos/settings', {
          timestampMigrationCompleted: true,
          migrationDate: dateUtils.toISOString(new Date())
        });
      } catch (settingError) {
        console.warn('Failed to save migration status:', settingError);
      }
    }

    return needsUpdate;
  } catch (error) {
    console.error('Failed to fix database timestamps:', error);
    throw new Error('타임스탬프 정규화 중 오류가 발생했습니다.');
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

// POS 전용 에러 처리 래퍼
const withPosErrorHandling = (fn, operationName) => async (...args) => {
  try {
    return await fn(...args);
  } catch (error) {
    // POS 전용 에러는 상위로 전파
    if (error instanceof ConcurrencyError || error instanceof TransactionError) {
      throw error;
    }
    // 일반적인 에러 처리
    handleError(error, {
      showToast: true,
      context: `POS_${operationName}`
    });
    throw error;
  }
};

// 공통 데이터 업데이트 헬퍼
const updatePosData = async (updateFn) => {
  try {
    const currentData = await apiClient.get('/pos');
    const updatedData = updateFn(currentData.data);
    const response = await apiClient.put('/pos', updatedData);
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      throw new ConcurrencyError();
    }
    throw error;
  }
};

// 설정 업데이트를 위한 공통 헬퍼
const updateSettings = (currentData, newSettings, settingsKey = 'settings') => ({
  ...currentData,
  [settingsKey]: {
    ...currentData[settingsKey],
    ...newSettings,
    updatedAt: dateUtils.toISOString(new Date())
  }
});

// API 메서드들
export const getPosStatus = withPosErrorHandling(
  async (posId) => {
    const response = await apiClient.get(`/pos/${posId}`);
    return response.data;
  },
  'GET_STATUS'
);

export const updatePosStatus = withPosErrorHandling(
  async (posId, statusData) => {
    return updatePosData(currentData => ({
      ...currentData,
      status: statusData.status,
      statusMetadata: {
        ...statusData,
        timestamp: toISOString(statusData.timestamp)
      }
    }));
  },
  'UPDATE_STATUS'
);

export const updatePosSettings = withPosErrorHandling(
  async (settings) => {
    return updatePosData(currentData => updateSettings(currentData, settings));
  },
  'updatePosSettings'
);

export const updatePosAutoSettings = withPosErrorHandling(
  async (settings) => {
    return updatePosData(currentData => updateSettings(currentData, settings, 'autoSettings'));
  },
  'updatePosAutoSettings'
);

export const getPosStatusHistory = withPosErrorHandling(
  async (posId, params = {}) => {
    const response = await apiClient.get(`/pos/${posId}/history`, { params });
    return response.data;
  },
  'getPosStatusHistory'
);

export const retryFailedTransaction = withPosErrorHandling(
  async (transactionId) => {
    const response = await apiClient.post(`/transactions/${transactionId}/retry`);
    return response.data;
  },
  'retryFailedTransaction'
);

const posAPI = {
  // POS 상태 조회 (타임스탬프 형식 검증 개선)
  getPosStatus: withPosErrorHandling(async () => {
    const response = await apiClient.get('/pos');
    
    // 마이그레이션이 필요한 경우에만 실행
    const needsMigration = await checkTimestampMigrationNeeded();
    if (needsMigration) {
      await fixDatabaseTimestamps();
    }
    
    return { status: response.data.currentStatus };
  }, 'getPosStatus'),

  // POS 상태 업데이트 (확장된 메타데이터 포함)
  updatePosStatus: withPosErrorHandling(async (status, metadata = {}) => {
    // 전체 데이터 조회 후 상태만 업데이트
    const currentData = await apiClient.get('/pos');
    const timestamp = dateUtils.toISOString(new Date());
    
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
      approvedAt: metadata.approvedAt ? dateUtils.toISOString(metadata.approvedAt) : null
    };

    // 기존 히스토리의 타임스탬프 형식 수정
    const updatedHistory = currentData.data.statusHistory.map(item => ({
      ...item,
      timestamp: dateUtils.toISOString(item.timestamp),
      approvedAt: item.approvedAt ? dateUtils.toISOString(item.approvedAt) : null
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
  getPosSettings: withPosErrorHandling(async () => {
    const response = await apiClient.get('/pos');
    return response.data.settings;
  }, 'getPosSettings'),

  // POS 상태 히스토리 조회 (확장된 필터링)
  getPosStatusHistory: withPosErrorHandling(async ({ 
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
        const itemDate = dateUtils.toDate(item.timestamp);
        const start = startDate ? dateUtils.toDate(startDate) : new Date(0);
        const end = endDate ? dateUtils.toDate(endDate) : new Date();
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
      dateUtils.toDate(b.timestamp) - dateUtils.toDate(a.timestamp)
    );
    
    return { history: statusHistory };
  }, 'getPosStatusHistory'),

  // POS 자동화 설정 조회
  getPosAutoSettings: withPosErrorHandling(async () => {
    const response = await apiClient.get('/pos');
    return response.data.settings;
  }, 'getPosAutoSettings'),

  // 분석 데이터 조회
  getPosAnalytics: withPosErrorHandling(async () => {
    const response = await apiClient.get('/pos');
    return response.data.analytics || {};
  }, 'getPosAnalytics'),

  // 알림 생성
  createNotification: withPosErrorHandling(async (notificationData) => {
    const newNotification = {
      id: generateId(),
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      timestamp: dateUtils.toISOString(new Date()),
      isRead: false,
      severity: notificationData.severity || 'INFO',
      relatedStatusChangeId: notificationData.relatedStatusChangeId || null
    };

    return updatePosData(currentData => ({
      ...currentData,
      notifications: [
        newNotification,
        ...(currentData.notifications || []).map(notification => ({
          ...notification,
          timestamp: dateUtils.toISOString(notification.timestamp)
        }))
      ]
    }));
  }, 'createNotification'),

  // 알림 목록 조회
  getNotifications: withPosErrorHandling(async ({ unreadOnly = false } = {}) => {
    const response = await apiClient.get('/pos');
    const notifications = response.data.notifications || [];
    
    if (unreadOnly) {
      return notifications.filter(notif => !notif.isRead);
    }
    
    return notifications;
  }, 'getNotifications'),

  // 알림 읽음 처리
  markNotificationAsRead: withPosErrorHandling(async (notificationId) => {
    return updatePosData(currentData => ({
      ...currentData,
      notifications: (currentData.notifications || []).map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    }));
  }, 'markNotificationAsRead'),

  // 모든 알림 읽음 처리
  markAllNotificationsAsRead: withPosErrorHandling(async () => {
    return updatePosData(currentData => ({
      ...currentData,
      notifications: (currentData.notifications || []).map(notif => ({
        ...notif,
        isRead: true
      }))
    }));
  }, 'markAllNotificationsAsRead')
};

export default posAPI; 
