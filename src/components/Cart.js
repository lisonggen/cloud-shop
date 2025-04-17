import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/config';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken } = useAuth();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlToken = searchParams.get('token');
    const authToken = urlToken || getToken();
    
    if (!authToken) {
      setLoading(false);
      setError('请先登录');
      return;
    }

    setToken(authToken);
    fetchCartItems(authToken);
  }, [location.search, getToken]);

  const handleLogin = () => {
    const url = new URL('/', window.location.origin);
    window.open(url.toString(), '_self');
  };

  const fetchCartItems = async (currentToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/api/cart/list`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      
      const result = await response.json();
      
      if (result.code === 1000) {
        setCartItems(result.data);
      } else if (result.code === 1001) {
        setError('登录已过期，请重新登录');
      } else {
        setError(result.msg || '获取购物车数据失败');
      }
    } catch (err) {
      setError('获取购物车数据失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (skuId, newQuantity) => {
    try {
      if (!token) {
        setError('请先登录');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/cart/api/cart/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skuId,
          quantity: newQuantity,
        }),
      });
      
      const result = await response.json();
      
      if (result.code === 1000) {
        fetchCartItems(token);
        // Notify other components to update cart count
        window.dispatchEvent(new CustomEvent('cart-updated'));
      } else if (result.code === 1001) {
        setError('登录已过期，请重新登录');
      } else {
        setError(result.msg || '更新数量失败');
      }
    } catch (err) {
      setError('更新数量失败: ' + err.message);
    }
  };

  const removeItem = async (skuId) => {
    try {
      if (!token) {
        setError('请先登录');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/cart/api/cart/delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skuId }),
      });
      
      const result = await response.json();
      
      if (result.code === 1000) {
        fetchCartItems(token);
        // Notify other components to update cart count
        window.dispatchEvent(new CustomEvent('cart-updated'));
      } else if (result.code === 1001) {
        setError('登录已过期，请重新登录');
      } else {
        setError(result.msg || '删除商品失败');
      }
    } catch (err) {
      setError('删除商品失败: ' + err.message);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0) / 100;
  };

  if (loading) return <div className="cart-loading">加载中...</div>;
  
  if (!token || error === '登录已过期，请重新登录' || error === '请先登录') {
    return (
      <div className="cart-container">
        <div className="login-prompt">
          <h2>请先登录</h2>
          <p>登录后即可查看您的购物车</p>
          <button className="login-button" onClick={handleLogin}>去登录</button>
        </div>
      </div>
    );
  }
  
  if (error) return <div className="cart-error">{error}</div>;

  return (
    <div className="cart-container">
      <h1>购物车</h1>
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>您的购物车是空的</p>
          <button className="continue-shopping" onClick={() => {
            const url = new URL('/', window.location.origin);
            window.open(url.toString(), '_self');
          }}>继续购物</button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.skuId} className="cart-item">
                <img src={item.image} alt={item.skuName} className="item-image" />
                <div className="item-details">
                  <h3>{item.skuName}</h3>
                  <p className="item-spec">{item.spec}</p>
                  <p className="item-price">¥{(item.price / 100).toFixed(2)}</p>
                  <div className="quantity-controls">
                    <button 
                      onClick={() => updateQuantity(item.skuId, Math.max(0, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.skuId, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button 
                  className="remove-item"
                  onClick={() => removeItem(item.skuId)}
                >
                  删除
                </button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <div className="total">
              <span>总计:</span>
              <span className="total-amount">¥{calculateTotal().toFixed(2)}</span>
            </div>
            <button className="checkout-button">结算</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart; 