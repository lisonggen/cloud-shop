import React, { useState } from 'react';
import './Login.css';
import { API_BASE_URL } from '../config/config';

function Login({ onClose, onSwitchToRegister, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/user/api/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.code === 1000) {
        // Get token from response headers
        const token = response.headers.get('token');
        if (token) {
          // Store token in localStorage
          localStorage.setItem('token', token);
        }
        // Handle successful login
        console.log('登录成功:', result.data);
        onLoginSuccess(); // Call the success callback to update button state
      } else {
        console.error('登录失败:', result.msg);
      }
    } catch (error) {
      console.error('登录请求出错:', error);
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
      </div>
    </div>
  );
}

export default Login; 