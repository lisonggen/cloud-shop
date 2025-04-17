import React, { useState } from 'react';
import './Register.css';
import { API_ENDPOINTS, API_BASE_URL } from '../config/config';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Register({ onClose, onSwitchToLogin, onRegister }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const { login } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致！');
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.USER_REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          phone: formData.phone,
          email: formData.email,
        }),
      });

      const result = await response.json();
      
      if (result.code === 1000) {
        // 注册成功后自动登录
        try {
          const loginResponse = await fetch(`${API_BASE_URL}/user/api/user/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
            }),
          });

          const loginResult = await loginResponse.json();
          
          if (loginResult.code === 1000) {
            const token = loginResponse.headers.get('token');
            if (token) {
              login(token, loginResult.data);
              navigate('/');
              onRegister();
            } else {
              setError('登录失败：未收到认证令牌');
            }
          } else {
            setError(loginResult.msg || '登录失败');
          }
        } catch (loginErr) {
          console.error('Login error after registration:', loginErr);
          setError('注册成功，但自动登录失败：' + loginErr.message);
        }
      } else {
        setError(result.msg || '注册失败，请重试！');
      }
    } catch (error) {
      console.error('注册错误:', error);
      setError('注册失败，请重试！');
    }
  };

  return (
    <div className="auth-modal">
      <div className="auth-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>注册</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="请输入用户名"
            />
          </div>
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
            <label htmlFor="phone">手机号</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="请输入手机号"
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
          <div className="form-group">
            <label htmlFor="confirmPassword">确认密码</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="请再次输入密码"
            />
          </div>
          <button type="submit" className="submit-button">注册</button>
        </form>
        <p className="switch-text">
          已有账号？
          <button className="switch-button" onClick={onSwitchToLogin}>
            立即登录
          </button>
        </p>
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}

export default Register; 