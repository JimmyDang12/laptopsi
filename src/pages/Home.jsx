import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/ProductCard'
import ProductDetail from '../components/ProductDetail'
import OrderModal from '../components/OrderModal'
import AuthModal from '../components/AuthModal'
import './Home.css'

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'con_hang', label: 'Còn hàng' },
  { key: 'da_ban', label: 'Đã bán' },
  { key: 'dang_ve', label: 'Đang về' },
]

export default function Home() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [selectedImages, setSelectedImages] = useState([])
  const [orderProduct, setOrderProduct] = useState(null)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => { if (user) fetchProducts(); else setLoading(false) }, [user])

  async function fetchProducts() {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  async function openDetail(product) {
    setSelected(product)
    const { data } = await supabase.from('product_images').select('*').eq('product_id', product.id).order('order')
    setSelectedImages(data || [])
  }

        const filtered = products

  if (!user) return (
    <div className="gate">
      <div className="gate-box">
        <div className="gate-icon">🔒</div>
        <h2>Đăng nhập để xem sản phẩm</h2>
        <p>Hệ thống dành cho đại lý và khách quen. Vui lòng đăng nhập để tiếp tục.</p>
        <button className="gate-btn" onClick={() => setShowAuth(true)}>Đăng nhập</button>
        <a href="tel:0972855866" className="gate-contact">📞 Liên hệ: 0972 855 866</a>
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )

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

      {selected && <ProductDetail product={selected} images={selectedImages} onClose={() => setSelected(null)} onOrder={(p) => { setSelected(null); setOrderProduct(p) }} />}
      {orderProduct && <OrderModal product={orderProduct} onClose={() => setOrderProduct(null)} />}
    </div>
  )
}
