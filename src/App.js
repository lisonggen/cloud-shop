import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryHistory, setCategoryHistory] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async (parentId) => {
    try {
      const url = parentId 
        ? `http://localhost:8080/goods/api/category/list?parentId=${parentId}`
        : 'http://localhost:8080/goods/api/category/list';
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.code === 1000) {
        setCategories(result.data);
      } else {
        setError('Failed to fetch categories');
      }
    } catch (err) {
      setError('Error fetching categories: ' + err.message);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setCategoryHistory([...categoryHistory, category]);
    fetchCategories(category.id);
  };

  const handleCategoryBack = () => {
    if (categoryHistory.length > 1) {
      const newHistory = categoryHistory.slice(0, -1);
      const previousCategory = newHistory[newHistory.length - 1];
      setCategoryHistory(newHistory);
      setSelectedCategory(previousCategory);
      fetchCategories(previousCategory.id);
    } else {
      setCategoryHistory([]);
      setSelectedCategory(null);
      fetchCategories();
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8080/goods/api/goods/list');
      const result = await response.json();
      
      if (result.code === 1000) {
        setProducts(result.data.map(item => ({
          id: item.id,
          name: item.name,
          price: 0, // Since price is not in the API response, setting default to 0
          image: item.image || "https://via.placeholder.com/200",
          description: item.caption
        })));
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      setError('Error fetching products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthClose = () => {
    setShowAuth(false);
  };

  const handleSwitchAuth = () => {
    setIsLogin(!isLogin);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowAuth(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('token');
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setShowAuth(false);
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setShowAuth(false);
  };

  return (
    <div className="App">
      {/* 导航栏 */}
      <nav className="navbar">
        <div className="nav-brand">Cloud Shop</div>
        <div className="nav-links">
          <a href="#home">首页</a>
          <a href="#categories">分类</a>
          <a href="#deals">特惠</a>
          <a href="#about">关于我们</a>
        </div>
        <div className="nav-right">
          <button 
            className="auth-button" 
            onClick={isLoggedIn ? handleLogout : () => setShowAuth(true)}
          >
            {isLoggedIn ? '登出' : '登录/注册'}
          </button>
          <div className="nav-cart">
            <span className="cart-icon">🛒</span>
            <span className="cart-count">0</span>
          </div>
        </div>
      </nav>

      {/* 主要内容区 */}
      <main className="main-content">
        {/* 分类和轮播图容器 */}
        <div className="categories-banner-container">
          {/* 商品分类 */}
          <div className="categories">
            <div className="category-navigation">
              {categoryHistory.length > 0 && (
                <button className="back-button" onClick={handleCategoryBack}>
                  返回上级
                </button>
              )}
              <div className="current-category">
                {selectedCategory ? selectedCategory.name : '全部分类'}
              </div>
            </div>
            <div className="category-list">
              {categories.map(category => (
                <div 
                  key={category.id} 
                  className="category-item"
                  onClick={() => handleCategoryClick(category)}
                >
                  {category.name}
                </div>
              ))}
            </div>
          </div>

          {/* 轮播图区域 */}
          <div className="banner">
            <h1>欢迎来到 Cloud Shop</h1>
            <p>发现更多优质商品</p>
          </div>
        </div>

        {/* 商品列表 */}
        <div className="products">
          <h2>热门商品</h2>
          {loading ? (
            <div className="loading">加载中...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <div className="product-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <img src={product.image} alt={product.name} />
                  <h3>{product.name}</h3>
                  <p className="price">¥{product.price}</p>
                  <p className="description">{product.description}</p>
                  <button className="add-to-cart">加入购物车</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>关于我们</h3>
            <p>Cloud Shop 是您的优质购物平台</p>
          </div>
          <div className="footer-section">
            <h3>客户服务</h3>
            <p>联系我们</p>
            <p>配送说明</p>
            <p>退换货政策</p>
          </div>
          <div className="footer-section">
            <h3>关注我们</h3>
            <p>微信公众号</p>
            <p>微博</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Cloud Shop. All rights reserved.</p>
        </div>
      </footer>

      {/* 登录/注册模态框 */}
      {showAuth && (
        isLogin ? (
          <Login
            onClose={handleAuthClose}
            onSwitchToRegister={handleSwitchAuth}
            onLoginSuccess={handleLoginSuccess}
          />
        ) : (
          <Register
            onClose={handleAuthClose}
            onSwitchToLogin={handleSwitchAuth}
            onRegister={handleRegister}
          />
        )
      )}
    </div>
  );
}

export default App;
