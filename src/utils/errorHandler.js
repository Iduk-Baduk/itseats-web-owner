import { toast } from 'react-toastify';

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

/**
 * API 에러 메시지를 사용자 친화적인 메시지로 변환
 * @param {Error} error - 에러 객체
 * @returns {string} 사용자 친화적인 에러 메시지
 */
export const getErrorMessage = (error) => {
  if (!error) {
    return '알 수 없는 오류가 발생했습니다.';
  }

  // API 응답 에러
  if (error.response) {
    const { status } = error.response;
    
    switch (status) {
      case 400:
        return '잘못된 요청입니다. 입력값을 확인해주세요.';
      case 401:
        return '인증이 필요합니다. 다시 로그인해주세요.';
      case 403:
        return '접근 권한이 없습니다.';
      case 404:
        return '요청하신 정보를 찾을 수 없습니다.';
      case 409:
        return '요청하신 작업을 처리할 수 없습니다. 다시 시도해주세요.';
      case 429:
        return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
      case 500:
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      default:
        return '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }
  }

  // 네트워크 에러
  if (error.request) {
    return '서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.';
  }

  // 기타 에러
  return error.message || '알 수 없는 오류가 발생했습니다.';
};

/**
 * 에러 로깅
 * @param {Error} error - 에러 객체
 * @param {string} context - 에러 발생 컨텍스트
 */
export const logError = (error, context = '') => {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    context,
    message: error.message,
    stack: error.stack,
    response: error.response?.data,
  };

  // 개발 환경에서는 콘솔에 출력
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', errorInfo);
  }

  // 사용자에게 에러 메시지 표시
  const userMessage = getErrorMessage(error);
  toast.error(userMessage);

  // TODO: 프로덕션 환경에서는 에러 모니터링 서비스로 전송
  // if (process.env.NODE_ENV === 'production') {
  //   sendErrorToMonitoring(errorInfo);
  // }
};

/**
 * 네트워크 연결 복구를 기다리는 함수
 * @param {number} timeout - 타임아웃 시간 (밀리초)
 * @returns {Promise} 네트워크 연결 복구 Promise
 */
const waitForNetworkRecovery = (timeout = 30000) => {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve();
      return;
    }

    const timeoutId = setTimeout(() => {
      window.removeEventListener('online', checkConnection);
      resolve();
    }, timeout);

    const checkConnection = () => {
      if (navigator.onLine) {
        clearTimeout(timeoutId);
        window.removeEventListener('online', checkConnection);
        resolve();
      }
    };

    window.addEventListener('online', checkConnection);
  });
};

/**
 * API 호출 재시도 함수
 * @param {Function} apiCall - API 호출 함수
 * @param {number} maxRetries - 최대 재시도 횟수
 * @param {number} delay - 재시도 간격 (밀리초)
 * @returns {Promise} API 호출 결과
 */
export const retryApiCall = async (apiCall, maxRetries = 3, delay = 1000) => {
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

      // 네트워크 에러인 경우 연결 복구 대기
      if (error.request && !navigator.onLine) {
        await waitForNetworkRecovery();
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

/**
 * 에러 처리 래퍼 함수
 * @param {Function} fn - 래핑할 함수
 * @param {string} context - 에러 발생 컨텍스트
 * @returns {Function} 에러 처리가 포함된 함수
 */
export const withErrorHandling = (fn, context = '') => {
  return async (...args) => {
    try {
      return await retryApiCall(() => fn(...args));
    } catch (error) {
      logError(error, context);
      throw error;
    }
  };
}; 
