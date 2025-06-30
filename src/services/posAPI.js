import apiClient from './apiClient';
import { withErrorHandling, retryApiCall } from '../utils/errorHandler';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1초

const posAPI = {
  // POS 상태 조회
  getPosStatus: withErrorHandling(async () => {
    const response = await apiClient.get('/pos');
    return { status: response.data.currentStatus };
  }, 'getPosStatus'),

  // POS 상태 업데이트
  updatePosStatus: withErrorHandling(async (status) => {
    // 전체 데이터 조회 후 상태만 업데이트
    const currentData = await apiClient.get('/pos');
    const updatedData = {
      ...currentData.data,
      currentStatus: status,
      lastUpdated: new Date().toISOString(),
      statusHistory: [
        {
          status: status,
          timestamp: new Date().toISOString()
        },
        ...currentData.data.statusHistory
      ]
    };
    
    const response = await apiClient.put('/pos', updatedData);
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
      settings: settings
    };
    
    const response = await apiClient.put('/pos', updatedData);
    return response.data;
  }, 'updatePosSettings'),

  // POS 상태 히스토리 조회
  getPosStatusHistory: withErrorHandling(async ({ startDate, endDate } = {}) => {
    const response = await apiClient.get('/pos');
    
    let statusHistory = response.data.statusHistory || [];
    
    // 날짜 필터링
    if (startDate || endDate) {
      statusHistory = statusHistory.filter(item => {
        const itemDate = new Date(item.timestamp);
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        return itemDate >= start && itemDate <= end;
      });
    }
    
    // 응답 데이터의 상태 히스토리를 시간순(오름차순)으로 정렬
    statusHistory.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
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
      settings: settings
    };
    
    const response = await apiClient.put('/pos', updatedData);
    return response.data;
  }, 'updatePosAutoSettings')
};

export default posAPI; 
