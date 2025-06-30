import apiClient from './apiClient';
import { withErrorHandling, retryApiCall } from '../utils/errorHandler';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1초



const posAPI = {
  // POS 상태 조회
  getPosStatus: withErrorHandling(async () => {
    const response = await apiClient.get('/pos/status');
    return response.data;
  }, 'getPosStatus'),

  // POS 상태 업데이트
  updatePosStatus: withErrorHandling(async (status) => {
    const response = await apiClient.put('/pos/status', { status });
    return response.data;
  }, 'updatePosStatus'),

  // POS 설정 조회
  getPosSettings: withErrorHandling(async () => {
    const response = await apiClient.get('/pos/settings');
    return response.data;
  }, 'getPosSettings'),

  // POS 설정 업데이트
  updatePosSettings: withErrorHandling(async (settings) => {
    const response = await apiClient.put('/pos/settings', settings);
    return response.data;
  }, 'updatePosSettings'),

  // POS 상태 히스토리 조회
  getPosStatusHistory: withErrorHandling(async ({ startDate, endDate } = {}) => {
    const response = await apiClient.get('/pos/status/history', {
      params: { startDate, endDate }
    });
    
    // 응답 데이터의 상태 히스토리를 시간순(오름차순)으로 정렬
    // 서버에서 정렬된 데이터가 오더라도, 클라이언트에서 한 번 더 정렬하여 순서 보장
    if (response.data.statusHistory) {
      response.data.statusHistory.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    }
    
    return response.data;
  }, 'getPosStatusHistory'),

  // POS 자동화 설정 조회
  getPosAutoSettings: withErrorHandling(async () => {
    const response = await apiClient.get('/pos/settings/auto');
    return response.data;
  }, 'getPosAutoSettings'),

  // POS 자동화 설정 업데이트
  updatePosAutoSettings: withErrorHandling(async (settings) => {
    const response = await apiClient.put('/pos/settings/auto', settings);
    return response.data;
  }, 'updatePosAutoSettings')
};

export default posAPI; 
