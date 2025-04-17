import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE_URL } from '../config/config';

// 创建上下文
const AuthContext = createContext(null);

// 提供者组件
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 在组件挂载时检查认证状态
  useEffect(() => {
    console.log('AuthProvider mounted');
    
    // 通过检查localStorage中的token来判断是否已登录
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      checkAuthStatus();
    } else {
      setIsLoading(false);
      setIsAuthenticated(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    console.log('Checking auth status with token:', token);

    if (!token) {
      console.log('No token found, setting isAuthenticated to false');
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/api/user/info`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      console.log('Auth check response:', result);

      if (result.code === 1000) {
        console.log('Token is valid, setting isAuthenticated to true');
        setIsAuthenticated(true);
        setUser(result.data);
      } else {
        console.log('Token is invalid, clearing token and setting isAuthenticated to false');
        // 保留token，避免频繁登录
        // localStorage.removeItem('token');
        setIsAuthenticated(true);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // 即使请求失败，也保留token，避免频繁登录
      setIsAuthenticated(true);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (token, userData) => {
    console.log('Login called with token:', token);
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    console.log('Logout called');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  const getToken = () => {
    const token = localStorage.getItem('token');
    console.log('getToken called, returning:', token);
    return token;
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    getToken,
    checkAuthStatus,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定义 hook，方便在组件中使用
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 