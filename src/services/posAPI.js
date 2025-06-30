import apiClient from './apiClient';

const POS_API = {
  // POS 상태 조회
  getPosStatus: async () => {
    const response = await apiClient.get('/api/pos/status');
    return response.data;
  },

  // POS 상태 업데이트
  updatePosStatus: async (status) => {
    const response = await apiClient.patch('/api/pos/status', { status });
    return response.data;
  },

  // POS 설정 조회
  getPosSettings: async () => {
    const response = await apiClient.get('/api/pos/settings');
    return response.data;
  },

  // POS 설정 업데이트
  updatePosSettings: async (settings) => {
    const response = await apiClient.patch('/api/pos/settings', settings);
    return response.data;
  },

  // POS 상태 히스토리 조회
  getPosStatusHistory: async (params) => {
    const response = await apiClient.get('/api/pos/status/history', { params });
    return response.data;
  },
};

export default POS_API; 
