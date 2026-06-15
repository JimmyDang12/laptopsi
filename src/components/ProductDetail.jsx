import { useState } from 'react'
import './ProductDetail.css'
const STATUS_MAP = { con_hang: { label: 'Còn hàng', color: '#22c55e' }, da_ban: { label: 'Đã bán', color: '#ef4444' }, dang_ve: { label: 'Đang về', color: '#f59e0b' } }

export default function ProductDetail({ product, images, onClose, onOrder }) {
  const [currentImg, setCurrentImg] = useState(0)
  const [zoom, setZoom] = useState(false)
  const status = STATUS_MAP[product.status] || STATUS_MAP.con_hang
  const allImages = images?.length > 0 ? images.map(i => i.image_url) : product.image_url ? [product.image_url] : []
  const formatPrice = (p) => p ? new Intl.NumberFormat('vi-VN').format(p) + '₫' : 'Liên hệ'

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
              {(product.status === 'con_hang' && (product.allow_order === undefined || product.allow_order === true)) && (
                <button className="btn-order" onClick={() => onOrder(product)}>🛒 Đặt hàng</button>
              )}
            </div>
          </div>
        </div>
      </div>
      {zoom && allImages.length > 0 && (
        <div className="zoom-overlay" onClick={() => setZoom(false)}>
          <img src={allImages[currentImg]} alt="" />
          <button className="zoom-close">✕</button>
        </div>
      )}
    </>
  )
}
