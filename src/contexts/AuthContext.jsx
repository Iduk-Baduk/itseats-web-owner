import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 복원
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // TODO: 실제 API 호출로 대체
      const response = await mockLoginAPI(credentials);
      setCurrentUser(response.user);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      return response.user;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    toast.success('로그아웃되었습니다.');
  };

  const value = {
    currentUser,
    login,
    logout,
    loading
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// TODO: 실제 API로 대체
const mockLoginAPI = async (credentials) => {
  // 임시 검증 로직
  if (credentials.username === 'admin' && credentials.password === 'password') {
    return {
      user: {
        userId: 'admin001',
        userName: '관리자',
        role: 'ADMIN',
        storeId: 'store001',
        storeName: '테스트 매장'
      }
    };
  }
  throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
};

export default AuthContext; 
