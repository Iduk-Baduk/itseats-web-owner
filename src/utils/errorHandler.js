import { ERROR_TYPES, ERROR_MESSAGES } from '../constants/errorTypes';
import toast from 'react-hot-toast';

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
export const retryApiCall = async (apiCall, maxRetries = MAX_RETRIES, delay = 1000) => {
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

      // 네트워크 에러인 경우
      if (!navigator.onLine || error.message.includes('Network')) {
        toast.error(ERROR_MESSAGES.NETWORK_ERROR);
        // 네트워크가 복구될 때까지 대기 (최대 30초)
        await waitForNetworkRecovery();
        continue;
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

export const getErrorType = (error) => {
  if (!error) return ERROR_TYPES.UNKNOWN;
  
  if (!navigator.onLine) return ERROR_TYPES.NETWORK;
  
  if (error.response) {
    const { status } = error.response;
    if (status === 401 || status === 403) return ERROR_TYPES.AUTH;
    if (status === 404) return ERROR_TYPES.NOT_FOUND;
    if (status >= 500) return ERROR_TYPES.SERVER;
    if (status === 400) return ERROR_TYPES.VALIDATION;
  }
  
  if (error.message?.includes('network')) return ERROR_TYPES.NETWORK;
  
  return ERROR_TYPES.UNKNOWN;
};

export const getErrorMessage = (error) => {
  const errorType = getErrorType(error);
  const defaultMessage = ERROR_MESSAGES[errorType];
  
  // API에서 에러 메시지를 제공하는 경우
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  return defaultMessage;
};

export const handleError = (error, options = {}) => {
  const {
    showToast = true,
    setError = null,
    errorField = 'submit',
  } = options;
  
  const message = getErrorMessage(error);
  console.error('Error occurred:', error);
  
  if (showToast) {
    toast.error(message);
  }
  
  if (setError) {
    setError(errorField, { message });
  }
  
  return message;
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
