import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './config/config';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import { AuthProvider, useAuth } from './context/AuthContext';

function MainContent({ 
  loading, 
  error, 
  products, 
  handleProductClick,
  categories,
  categoryHistory,
  handleCategoryBack,
  handleCategoryClick,
  selectedCategory 
}) {
  return (
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
              <div 
                key={product.id} 
                className="product-card"
                onClick={() => handleProductClick(product.id)}
                style={{ cursor: 'pointer' }}
              >
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
  );
}

function NavCart({ itemCount = 0 }) {
  const handleCartClick = () => {
    const url = new URL('/cart', window.location.origin);
    window.open(url.toString(), '_blank');
  };

  return (
    <div className="nav-cart" onClick={handleCartClick}>
      <span className="cart-icon">🛒</span>
      <span className="cart-count">{itemCount}</span>
    </div>
  );
}

function AppContent() {
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryHistory, setCategoryHistory] = useState([]);
  const [state, setState] = useState({});
  const { isAuthenticated, logout, getToken, isLoading } = useAuth();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async (parentId) => {
    try {
      const url = parentId 
        ? `${API_BASE_URL}/goods/api/category/list?parentId=${parentId}`
        : `${API_BASE_URL}/goods/api/category/list`;
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
      const response = await fetch(`${API_BASE_URL}/goods/api/goods/list`);
      const result = await response.json();
      
      if (result.code === 1000) {
        setProducts(result.data.map(item => ({
          id: item.id,
          name: item.name,
          price: 0,
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
    setShowAuth(false);
    // Force a re-render
    setState({});
  };

  const handleLogout = () => {
    logout();
    console.log('Logged out, token removed from localStorage');
    // Verify token is removed
    console.log('Token after logout:', localStorage.getItem('token'));
    // Force a re-render
    setState({});
  };

  const handleProductClick = (productId) => {
    const url = new URL(`/product/${productId}`, window.location.origin);
    window.open(url.toString(), '_blank');
  };

  return (
    <div className="App">
      {/* 导航栏 */}
      <nav className="navbar">
        <div className="nav-brand">Cloud Shop</div>
        <div className="nav-links">
          <Link to="/">首页</Link>
          <Link to="/categories">分类</Link>
          <Link to="/deals">特惠</Link>
          <Link to="/about">关于我们</Link>
        </div>
        <div className="nav-right">
          {!isLoading && (
            <button 
              className="auth-button" 
              onClick={isAuthenticated ? handleLogout : () => setShowAuth(true)}
            >
              {isAuthenticated ? '登出' : '登录/注册'}
            </button>
          )}
          <NavCart />
        </div>
      </nav>

      <Routes>
        <Route path="/" element={
          <MainContent 
            loading={loading}
            error={error}
            products={products}
            handleProductClick={handleProductClick}
            categories={categories}
            categoryHistory={categoryHistory}
            handleCategoryBack={handleCategoryBack}
            handleCategoryClick={handleCategoryClick}
            selectedCategory={selectedCategory}
          />
        } />
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>

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
            onClose={() => setShowAuth(false)}
            onSwitchToRegister={() => setIsLogin(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        ) : (
          <Register
            onClose={() => setShowAuth(false)}
            onSwitchToLogin={() => setIsLogin(true)}
            onRegister={handleLoginSuccess}
          />
        )
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
