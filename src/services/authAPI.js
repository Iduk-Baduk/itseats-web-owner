import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import { STORAGE_KEYS } from '../utils/logger';
import { saveToken, clearToken } from '../utils/tokenUtils';

// 회원가입 API
export const register = async (form) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.MEMBERS.SIGN_UP(), form);

    return {
      success: true,
      user: {
        id: response.data.memberId,
        username: form.username,
        name: form.name,
        email: form.email,
        phone: form.phone,
        storeId: null,
        storeName: null,
      },
      message: '회원가입이 완료되었습니다.'
    };
  } catch (error) {
    if (error.response) {
      error.message = JSON.stringify(error.response.data) || '회원가입에 실패했습니다.';
    }
    throw error;
  }
};

// 로그인 API
export const login = async ({ username, password }) => {
  try {
    if (!username || !password) {
      throw new Error('아이디와 비밀번호를 모두 입력해주세요.');
    }

    const response = await apiClient.post(API_ENDPOINTS.MEMBERS.LOGIN(), { username, password });
    const accessToken = response.headers["access-token"];
    
    // 토큰 저장 (24시간 만료)
    const expiresIn = 24 * 60 * 60 * 1000;
    saveToken(accessToken, expiresIn);

    const currentMember = await apiClient.get(API_ENDPOINTS.MEMBERS.ME());

    return {
      success: true,
      user: {
        userId: currentMember.data.memberId,
        userName: currentMember.data.username,
        name: currentMember.data.name,
        nickname: currentMember.data.nickname,
        email: currentMember.data.email,
        phone: currentMember.data.phone,
        storeId: currentMember.data.stores[0]?.storeId || null,
        storeName: currentMember.data.stores[0]?.storeName || null,
      },
      accessToken,
    };
  } catch (error) {
    if (error.response) {
      error.message = JSON.stringify(error.response.data) || '로그인에 실패했습니다.';
    }
    throw error;
  }
}

// 내 정보 조회 API
export const getCurrentUser = async () => {
  const response = await apiClient.get(API_ENDPOINTS.MEMBERS.ME());
  return {
    userId: response.data.memberId,
    userName: response.data.username,
    name: response.data.name,
    email: response.data.email,
    phone: response.data.phone,
    storeId: response.data.stores[0]?.storeId || null,
    storeName: response.data.stores[0]?.storeName || null,
    stores: response.data.stores || [],
  };
};

// 로그아웃
export const logout = () => {
  clearToken();
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  return { success: true, message: '로그아웃되었습니다.' };
};

const AuthAPI = {
  register,
  login,
  getCurrentUser,
  logout,
}

export default AuthAPI;
