import { useState, useEffect } from 'react'
import './ProductDetail.css'
import { statusLabel, statusColor, isCustomerVisible } from '../lib/productStatus'

export default function ProductDetail({ product, images, onClose, onOrder }) {
  const [currentImg, setCurrentImg] = useState(0)
  const [zoom, setZoom] = useState(false)
  const status = { label: statusLabel(product.status), color: statusColor(product.status) }
  // Gộp ảnh đại diện (image_url) với các ảnh phụ (product_images), loại trùng
  const galleryImages = images?.length > 0 ? images.map(i => i.image_url) : []
  const allImages = [...new Set([product.image_url, ...galleryImages].filter(Boolean))]
  const formatPrice = (p) => p ? new Intl.NumberFormat('vi-VN').format(p) + '₫' : 'Liên hệ'

  // Reset về ảnh đầu khi đổi sản phẩm
  useEffect(() => { setCurrentImg(0) }, [product?.id])

  const prevImg = (e) => { e?.stopPropagation(); setCurrentImg(i => (i - 1 + allImages.length) % allImages.length) }
  const nextImg = (e) => { e?.stopPropagation(); setCurrentImg(i => (i + 1) % allImages.length) }

  return (
    <>
      <div className="detail-overlay" onClick={onClose}>
        <div className="detail-modal" onClick={e => e.stopPropagation()}>
          <button className="detail-close" onClick={onClose}>✕</button>
          <div className="detail-gallery">
            {allImages.length > 0 ? (
              <>
                <div className="gallery-main" onClick={() => setZoom(true)}>
                  <img src={allImages[currentImg]} alt={product['Tên sản phẩm']} />
                  <span className="gallery-zoom">🔍</span>
                  {allImages.length > 1 && (
                    <>
                      <button className="gallery-nav prev" onClick={prevImg} aria-label="Ảnh trước">‹</button>
                      <button className="gallery-nav next" onClick={nextImg} aria-label="Ảnh sau">›</button>
                      <span className="gallery-counter">{currentImg + 1}/{allImages.length}</span>
                    </>
                  )}
                </div>
                {allImages.length > 1 && (
                  <div className="gallery-thumbs">
                    {allImages.map((url, i) => <img key={i} src={url} alt="" className={i === currentImg ? 'active' : ''} onClick={() => setCurrentImg(i)} />)}
                  </div>
                )}
              </>
            ) : <div className="gallery-empty">💻</div>}
          </div>
          <div className="detail-info">
            <div className="detail-header">
              <h2>{product['Tên sản phẩm']}</h2>
              <span className="detail-status" style={{ background: status.color }}>{status.label}</span>
            </div>
            <p className="detail-price">{formatPrice(product['Giá bán'])}</p>
            <div className="detail-specs">
              {[['Cấu hình','cấu hình'],['Serial','Serial'],['Màu','Màu'],['Pin','Tình trạng pin'],['Ngoại hình','Ngoại hình'],['Ghi chú','Ghi chú']].map(([label, key]) =>
                product[key] ? <div key={key} className="spec-row"><span>{label}</span><span>{product[key]}</span></div> : null
              )}
            </div>
            <div className="detail-actions">
              <a className="btn-call" href="tel:0972855866">📞 Gọi ngay</a>
              <a className="btn-zalo" href="https://zalo.me/0972855866" target="_blank" rel="noreferrer">💬 Zalo</a>
              {(isCustomerVisible(product.status) && (product.allow_order === undefined || product.allow_order === true)) && (
                <button className="btn-order" onClick={() => onOrder(product)}>🛒 Đặt hàng</button>
              )}
            </div>
          </div>
        </div>
      </div>
      {zoom && allImages.length > 0 && (
        <div className="zoom-overlay" onClick={() => setZoom(false)}>
          {allImages.length > 1 && <button className="zoom-nav prev" onClick={prevImg} aria-label="Ảnh trước">‹</button>}
          <img src={allImages[currentImg]} alt="" />
          {allImages.length > 1 && <button className="zoom-nav next" onClick={nextImg} aria-label="Ảnh sau">›</button>}
          {allImages.length > 1 && <span className="zoom-counter">{currentImg + 1}/{allImages.length}</span>}
          <button className="zoom-close">✕</button>
        </div>
      )}
    </>
  )
}
