import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config/config';
import './ProductDetail.css';

function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedSku, setSelectedSku] = useState(null);
  const [selectedSpecs, setSelectedSpecs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 安全地解析JSON字符串
  const safeJsonParse = (str, fallback = {}) => {
    try {
      if (!str) return fallback;
      // 处理单引号的情况
      const normalizedStr = str.replace(/'/g, '"');
      return JSON.parse(normalizedStr);
    } catch (e) {
      console.error('JSON parse error:', e);
      return fallback;
    }
  };

  // 确保规格值是数组
  const ensureSpecValuesArray = (specItems) => {
    const result = {};
    Object.entries(specItems).forEach(([key, value]) => {
      result[key] = Array.isArray(value) ? value : [value];
    });
    return result;
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/goods/api/goods/id/${productId}`);
        const result = await response.json();
        
        if (result.code === 1000) {
          setProduct(result.data);
          // 设置第一个SKU为默认选中
          if (result.data.skus && result.data.skus.length > 0) {
            const firstSku = result.data.skus[0];
            setSelectedSku(firstSku);
            // 初始化选中规格
            const firstSkuSpecs = safeJsonParse(firstSku.spec);
            setSelectedSpecs(firstSkuSpecs);
          }
        } else {
          setError('获取商品详情失败');
        }
      } catch (err) {
        setError('获取商品详情出错: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  if (loading) return <div className="loading">加载中...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="error">商品不存在</div>;

  const { spu, skus } = product;
  const specItems = ensureSpecValuesArray(safeJsonParse(spu.specItems));

  const handleSpecSelect = (specName, value) => {
    const newSelectedSpecs = { ...selectedSpecs, [specName]: value };
    setSelectedSpecs(newSelectedSpecs);
    
    // 查找匹配的SKU
    const matchingSku = skus.find(sku => {
      const skuSpecs = safeJsonParse(sku.spec);
      return Object.entries(newSelectedSpecs).every(([key, val]) => skuSpecs[key] === val);
    });
    
    if (matchingSku) {
      setSelectedSku(matchingSku);
    }
  };

  const isSpecAvailable = (specName, value) => {
    // 检查是否有任何SKU包含这个规格值且有库存
    return skus.some(sku => {
      const skuSpecs = safeJsonParse(sku.spec);
      // 首先检查这个规格值是否匹配
      if (skuSpecs[specName] !== value) {
        return false;
      }
      
      // 检查其他已选规格是否匹配
      const otherSpecsMatch = Object.entries(selectedSpecs).every(([key, val]) => {
        // 跳过当前正在检查的规格
        if (key === specName) return true;
        // 如果这个规格还没选择，也跳过
        if (!val) return true;
        // 检查规格值是否匹配
        return skuSpecs[key] === val;
      });

      // 最后检查库存
      return otherSpecsMatch && sku.num > 0;
    });
  };

  // 检查是否所有规格都已选择
  const areAllSpecsSelected = () => {
    return Object.keys(specItems).every(specName => selectedSpecs[specName]);
  };

  // 处理加入购物车
  const handleAddToCart = () => {
    if (!areAllSpecsSelected()) {
      alert('请选择商品规格');
      return;
    }
    // TODO: 实现加入购物车逻辑
  };

  // 处理立即购买
  const handleBuyNow = () => {
    if (!areAllSpecsSelected()) {
      alert('请选择商品规格');
      return;
    }
    // TODO: 实现立即购买逻辑
  };

  // 处理商品图片
  const renderProductImages = () => {
    if (!spu.introduction) return null;
    
    const images = spu.introduction.split('<br/>').filter(img => {
      const srcMatch = img.match(/src='([^']+)'/);
      return srcMatch && srcMatch[1];
    });

    if (images.length === 0) return null;

    return (
      <div className="product-gallery">
        <div className="main-image">
          {selectedSku?.image && (
            <img 
              src={selectedSku.image} 
              alt={selectedSku.name || '商品图片'} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-image.jpg'; // 设置默认图片
              }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="product-detail">
      <div className="product-container">
        {renderProductImages()}

        <div className="product-info">
          <div className="product-header">
            <h1 className="product-title">{spu.name}</h1>
            <p className="product-caption">{spu.caption}</p>
          </div>

          {selectedSku && (
            <div className="product-price-section">
              <div className="price">¥{(selectedSku.price / 100).toFixed(2)}</div>
              <div className="stock">库存: {selectedSku.num}件</div>
            </div>
          )}

          <div className="specifications-section">
            {Object.entries(specItems).map(([specName, values]) => (
              <div key={specName} className="spec-group">
                <div className="spec-name">{specName}</div>
                <div className="spec-values">
                  {values.map(value => (
                    <button
                      key={value}
                      className={`spec-value-btn ${selectedSpecs[specName] === value ? 'selected' : ''} 
                                ${!isSpecAvailable(specName, value) ? 'disabled' : ''}`}
                      onClick={() => handleSpecSelect(specName, value)}
                      disabled={!isSpecAvailable(specName, value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="product-actions">
            <div className="quantity-selector">
              <button className="quantity-btn">-</button>
              <input type="number" min="1" defaultValue="1" className="quantity-input" />
              <button className="quantity-btn">+</button>
            </div>
            <button className="add-to-cart-btn" onClick={handleAddToCart}>加入购物车</button>
            <button className="buy-now-btn" onClick={handleBuyNow}>立即购买</button>
          </div>

          <div className="product-meta">
            <div className="meta-item">
              <span className="meta-label">商品编号:</span>
              <span className="meta-value">{spu.sn || 'N/A'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">品牌:</span>
              <span className="meta-value">{selectedSku?.brandName || 'N/A'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">销量:</span>
              <span className="meta-value">{spu.saleNum}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">评论数:</span>
              <span className="meta-value">{spu.commentNum}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="product-detail-tabs">
        <div className="tab-content">
          <h2>商品详情</h2>
          {spu.introduction && (
            <div className="product-gallery">
              {spu.introduction.split('<br/>').map((img, index) => {
                const srcMatch = img.match(/src='([^']+)'/);
                return srcMatch ? (
                  <img 
                    key={index} 
                    src={srcMatch[1]} 
                    alt={`商品详情图 ${index + 1}`}
                    className="detail-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.jpg'; // 设置默认图片
                    }}
                  />
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail; 