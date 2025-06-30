export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTH: 'AUTH_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

export const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: '네트워크 연결을 확인해 주세요.',
  [ERROR_TYPES.VALIDATION]: '입력값을 확인해 주세요.',
  [ERROR_TYPES.AUTH]: '로그인이 필요하거나 권한이 없습니다.',
  [ERROR_TYPES.NOT_FOUND]: '요청하신 정보를 찾을 수 없습니다.',
  [ERROR_TYPES.SERVER]: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  [ERROR_TYPES.UNKNOWN]: '오류가 발생했습니다. 다시 시도해 주세요.',
}; 
