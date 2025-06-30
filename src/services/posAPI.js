import apiClient from './apiClient';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1초

/**
 * 지정된 횟수만큼 API 호출을 재시도하는 함수
 * @param {Function} apiCall - API 호출 함수
 * @param {number} maxRetries - 최대 재시도 횟수
 * @param {number} delay - 재시도 간격 (밀리초)
 * @returns {Promise} API 호출 결과
 */
const retryApiCall = async (apiCall, maxRetries = MAX_RETRIES, delay = RETRY_DELAY) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // 재시도가 의미 없는 에러인 경우 즉시 실패 처리
      if (error.response) {
        const status = error.response.status;
        if (status === 401 || status === 403 || status === 404) {
          throw error;
        }
      }

      // 마지막 시도가 아닌 경우 대기 후 재시도
      if (attempt < maxRetries) {
        console.warn(`API 호출 실패 (${attempt}번째 시도): ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }

  console.error(`API 호출 실패 (${maxRetries}회 재시도 후): ${lastError.message}`);
  throw lastError;
};

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
    // 타임스탬프 기준 내림차순 정렬 (최신순)
    response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return response.data;
  },
};

export default POS_API; 
