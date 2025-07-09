import axios from "axios";
import { API_CONFIG } from "../config/api";
import { getToken, isTokenValid, clearToken } from "../utils/tokenUtils";

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// 요청 인터셉터 - 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    // 로그인 요청은 토큰 제외
    if (config.url?.includes('/login'))
      return config;

    // 토큰 유효성 검사 후 추가
    if (isTokenValid()) {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response) => {
    // login 요청일 때는 전체 응답 반환
    if (response.config.url?.includes('/login')) {
      return response;
    }

    return response.data; // 자동으로 .data 반환
  },
  (error) => {
    // 서버 연결 실패 시 더 친화적인 메시지
    if (!error.response) {
      const networkError = new Error('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      networkError.type = 'NETWORK_ERROR';
      networkError.statusCode = 0;
      networkError.originalError = error;
      return Promise.reject(networkError);
    }

    // 인증 에러 처리
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearToken();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
