import React, { useState } from 'react';
import './Login.css';

function Login({ onClose, onSwitchToRegister }) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 实现登录逻辑
    console.log('登录信息:', formData);
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