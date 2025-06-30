// 에러 메시지 상수
export const ERROR_MESSAGES = {
  POS_STATUS_UPDATE: '매장 상태 변경에 실패했습니다.',
  POS_SETTINGS_UPDATE: '자동화 설정 변경에 실패했습니다.',
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.'
};

// 최대 재시도 횟수
const MAX_RETRIES = 3;

/**
 * API 호출을 재시도하는 함수
 * @param {Function} apiCall - API 호출 함수
 * @param {Object} options - 옵션 (재시도 횟수, 에러 메시지 등)
 * @returns {Promise} API 호출 결과
 */
export const retryApiCall = async (apiCall, options = {}) => {
  const {
    maxRetries = MAX_RETRIES,
    errorMessage = ERROR_MESSAGES.UNKNOWN_ERROR,
    onError = () => {},
  } = options;

  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      console.error(`API call failed (attempt ${i + 1}/${maxRetries}):`, error);
      
      // 네트워크 에러인 경우
      if (!navigator.onLine || error.message.includes('Network')) {
        onError(ERROR_MESSAGES.NETWORK_ERROR);
        // 네트워크가 복구될 때까지 대기
        await new Promise(resolve => {
          const checkConnection = () => {
            if (navigator.onLine) {
              window.removeEventListener('online', checkConnection);
              resolve();
            }
          };
          window.addEventListener('online', checkConnection);
        });
        continue;
      }
      
      onError(errorMessage);
      
      // 마지막 시도가 아닌 경우 잠시 대기
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  throw lastError;
}; 
