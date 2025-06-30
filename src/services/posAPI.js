import apiClient from './apiClient';
import { withErrorHandling, retryApiCall } from '../utils/errorHandler';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1초

// 고유 ID 생성 헬퍼
const generateId = () => 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

// 타임스탬프 형식 검증 및 수정 헬퍼
const formatTimestamp = (timestamp) => {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return new Date().toISOString();
    }
    return date.toISOString();
  } catch (error) {
    return new Date().toISOString();
  }
};

const posAPI = {
  // POS 상태 조회
  getPosStatus: withErrorHandling(async () => {
    const response = await apiClient.get('/pos');
    return { status: response.data.currentStatus };
  }, 'getPosStatus'),

  // POS 상태 업데이트 (확장된 메타데이터 포함)
  updatePosStatus: withErrorHandling(async (status, metadata = {}) => {
    // 전체 데이터 조회 후 상태만 업데이트
    const currentData = await apiClient.get('/pos');
    const timestamp = formatTimestamp(new Date().toISOString());
    
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
      approvedAt: metadata.approvedAt ? formatTimestamp(metadata.approvedAt) : null
    };

    // 기존 히스토리의 타임스탬프 형식 수정
    const updatedHistory = currentData.data.statusHistory.map(item => ({
      ...item,
      timestamp: formatTimestamp(item.timestamp),
      approvedAt: item.approvedAt ? formatTimestamp(item.approvedAt) : null
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
      timestamp: formatTimestamp(new Date().toISOString()),
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
          timestamp: formatTimestamp(notification.timestamp)
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
