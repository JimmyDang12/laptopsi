import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/ProductCard'
import ProductDetail from '../components/ProductDetail'
import OrderModal from '../components/OrderModal'
import AuthModal from '../components/AuthModal'
import { isCustomerVisible } from '../lib/productStatus'
import './Home.css'

// FILTERS removed (unused). Re-introduce when adding a filter UI.

export default function Home() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [selectedImages, setSelectedImages] = useState([])
  const [orderProduct, setOrderProduct] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [search, setSearch] = useState('')

  async function fetchProducts() {
    setLoading(true)
    // Khách chưa đăng nhập: dùng view products_public (không có cột Giá bán). Đã đăng nhập: bảng products.
    const table = user ? 'products' : 'products_public'
    const { data } = await supabase.from(table).select('*').order('created_at', { ascending: false })
    // Chỉ hiển thị máy thuộc nhóm "Đang bán" (ẩn đã bán + máy cần xử lý)
    setProducts((data || []).filter(p => isCustomerVisible(p.status)))
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [user])

  async function openDetail(product) {
    setSelected(product)
    const { data } = await supabase.from('product_images').select('*').eq('product_id', product.id).order('order')
    setSelectedImages(data || [])
  }

  // Tìm kiếm cho khách: gộp tên/serial/cấu hình/ghi chú, không phân biệt hoa thường, khớp một phần (OR)
  const q = search.trim().toLowerCase()
  const filtered = q
    ? products.filter(p =>
        (p['Tên sản phẩm'] || '').toLowerCase().includes(q) ||
        (p['Serial'] || '').toLowerCase().includes(q) ||
        (p['cấu hình'] || '').toLowerCase().includes(q) ||
        (p['Ghi chú'] || '').toLowerCase().includes(q)
      )
    : products

  return (
    <div className="home">
      <div className="hero">
        <div className="hero-inner">
          <p className="hero-eyebrow">Chuyên Surface · MacBook · Dell</p>
          <h1>Laptop chính hãng<br /><span>giá tốt nhất Hà Nội</span></h1>
          <p className="hero-sub">Bảo hành đầy đủ — hỗ trợ 8:00–21:00</p>
          <div className="hero-btns">
            <a href="tel:0972855866" className="hero-btn-primary">📞 Gọi ngay</a>
            <a href="https://zalo.me/0972855866" className="hero-btn-outline" target="_blank" rel="noreferrer">💬 Nhắn Zalo</a>
          </div>
        </div>
      </div>



      <div className="products-section">
        <div className="home-search-bar">
          <input
            className="home-search"
            placeholder="🔍 Tìm laptop theo tên, serial, cấu hình..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {loading ? <div className="loading-state">Đang tải sản phẩm...</div>
          : filtered.length === 0 ? <div className="empty-state">Không có sản phẩm nào</div>
          : <div className="products-grid">{filtered.map(p => <ProductCard key={p.id} product={p} onClick={openDetail} />)}</div>}
      </div>

      <div className="contact-section">
        <div className="contact-card">
          <div className="contact-info">
            <div className="contact-avatar">SL</div>
            <div>
              <p className="contact-name">Smartlaptop Store</p>
              <p className="contact-phone">0972 855 866 · 8:00–21:00</p>
            </div>
          </div>
          <div className="contact-btns">
            <a href="tel:0972855866" className="btn-call">📞 Gọi</a>
            <a href="https://zalo.me/0972855866" className="btn-zalo" target="_blank" rel="noreferrer">💬 Zalo</a>
          </div>
        </div>
      </div>

      <footer className="footer">© 2026 Smartlaptop Store · laptopsi.store</footer>

      {selected && <ProductDetail product={selected} images={selectedImages} onClose={() => setSelected(null)} onOrder={(p) => {
        // Require login before placing an order: show AuthModal if user not logged in
        if (!user) { setSelected(null); setShowAuth(true); return }
        setSelected(null); setOrderProduct(p)
      }} />}
      {orderProduct && <OrderModal product={orderProduct} onClose={() => setOrderProduct(null)} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}
