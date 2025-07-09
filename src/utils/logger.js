// 환경에 따른 로깅 유틸리티
export const logger = {
  log: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },
  warn: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args);
    }
  },
  error: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(...args);
    }
  }
};

// localStorage 키 상수
export const STORAGE_KEYS = {
  CURRENT_USER: 'currentUser',
  AUTH_TOKEN: 'authToken',
}; 
