import './ProductCard.css'
const STATUS_MAP = { con_hang: { label: 'Còn hàng', color: '#22c55e' }, da_ban: { label: 'Đã bán', color: '#ef4444' }, dang_ve: { label: 'Đang về', color: '#f59e0b' } }

export default function ProductCard({ product, onClick }) {
  const status = STATUS_MAP[product.status] || STATUS_MAP.con_hang
  const image = product.image_url || null
  const formatPrice = (p) => p ? new Intl.NumberFormat('vi-VN').format(p) + '₫' : 'Liên hệ'
  return (
    <div className="product-card" onClick={() => onClick(product)}>
      <div className="card-image">
        {image ? <img src={image} alt={product['Tên sản phẩm']} /> : <div className="card-image-placeholder">💻</div>}
        <span className="status-badge" style={{ background: status.color }}>{status.label}</span>
      </div>
      <div className="card-body">
        <h3 className="card-name">{product['Tên sản phẩm']}</h3>
        {product['cấu hình'] && <p className="card-spec">{product['cấu hình']}</p>}
        <div className="card-tags">
          {product['Màu'] && <span className="tag">{product['Màu']}</span>}
          {product['Ngoại hình'] && <span className="tag">{product['Ngoại hình']}</span>}
          {product['Tình trạng pin'] && <span className="tag">🔋 {product['Tình trạng pin']}</span>}
        </div>
        <div className="card-footer">
          <p className="card-price">{formatPrice(product['Giá bán'])}</p>
          <button className="card-btn">Xem chi tiết</button>
        </div>
      </div>
    </div>
  )
}
