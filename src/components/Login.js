import React, { useState } from 'react';
import './Login.css';
import { API_BASE_URL } from '../config/config';
import { useAuth } from '../context/AuthContext';

function Login({ onClose, onSwitchToRegister, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { login } = useAuth();
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      console.log('Attempting login...');
      const response = await fetch(`${API_BASE_URL}/user/api/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // 打印所有响应头
      console.log('Login response headers:', Object.fromEntries(response.headers.entries()));
      
      const result = await response.json();
      console.log('Login response:', result);

      if (result.code === 1000) {
        // 尝试从响应头获取token
        let token = response.headers.get('token') || response.headers.get('Token');
        
        // 如果响应头中没有token，尝试从响应体中获取
        if (!token && result.data && result.data.token) {
          token = result.data.token;
        }
        
        console.log('Token received:', token);
        
        if (token) {
          // 将token保存到localStorage
          localStorage.setItem('token', token);
          login(token, result.data);
          console.log('Login successful, token stored in localStorage:', localStorage.getItem('token'));
          
          // 关闭登录框
          onClose();
          
          // 调用登录成功回调
          if (onLoginSuccess) {
            onLoginSuccess();
          }
        } else {
          console.error('No token in response');
          setError('登录失败：未收到认证令牌');
        }
      } else {
        console.error('Login failed:', result.msg);
        setError(result.msg || '登录失败');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('登录失败：' + err.message);
    }
  };

  return (
    <div className="auth-modal">
      <div className="auth-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>登录</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">邮箱</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="请输入邮箱"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="请输入密码"
            />
          </div>
          <button type="submit" className="submit-button">登录</button>
        </form>
        <p className="switch-text">
          还没有账号？
          <button className="switch-button" onClick={onSwitchToRegister}>
            立即注册
          </button>
        </p>
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}

export default Login; 