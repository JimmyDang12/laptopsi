#!/bin/bash
# Script tạo toàn bộ file React cho laptopsi
# Chạy từ thư mục: ~/Desktop/laptopsi/laptopsi

echo "🚀 Đang tạo cấu trúc project..."

mkdir -p src/lib src/context src/components src/pages

# =====================
# src/lib/supabase.js
# =====================
cat > src/lib/supabase.js << 'EOF'
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
EOF

# =====================
# src/context/AuthContext.jsx
# =====================
cat > src/context/AuthContext.jsx << 'EOF'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) checkAdmin(session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) checkAdmin(session.user.id)
      else { setIsAdmin(false); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function checkAdmin(userId) {
    const { data } = await supabase.from('admin_users').select('id').eq('user_id', userId).single()
    setIsAdmin(!!data)
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
EOF

# =====================
# src/index.css
# =====================
cat > src/index.css << 'EOF'
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f5f6f8;
  color: #1a1a1a;
  -webkit-font-smoothing: antialiased;
}
EOF

# =====================
# src/App.css
# =====================
cat > src/App.css << 'EOF'
.app { min-height: 100vh; }
.app-loading {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
}
.spinner {
  width: 36px; height: 36px;
  border: 3px solid #e5e7eb;
  border-top-color: #378ADD;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
EOF

# =====================
# src/main.jsx
# =====================
cat > src/main.jsx << 'EOF'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>
)
EOF

# =====================
# src/App.jsx
# =====================
cat > src/App.jsx << 'EOF'
import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import AuthModal from './components/AuthModal'
import Home from './pages/Home'
import './App.css'

function AppContent() {
  const [showAuth, setShowAuth] = useState(false)
  const { loading } = useAuth()
  if (loading) return <div className="app-loading"><div className="spinner"></div></div>
  return (
    <div className="app">
      <Navbar onAuthClick={() => setShowAuth(true)} />
      <Home />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>
}
EOF

# =====================
# src/components/Navbar.jsx
# =====================
cat > src/components/Navbar.jsx << 'EOF'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar({ onAuthClick }) {
  const { user, isAdmin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  async function handleLogout() { await supabase.auth.signOut(); setMenuOpen(false) }
  return (
    <nav className="navbar">
      <div className="nav-brand"><span className="nav-icon">💻</span><span>Smartlaptop Store</span></div>
      <div className="nav-right">
        {user ? (
          <div className="nav-user">
            <button className="nav-avatar" onClick={() => setMenuOpen(!menuOpen)}>
              {user.email[0].toUpperCase()}
            </button>
            {menuOpen && (
              <div className="nav-dropdown">
                <p className="nav-email">{user.email}</p>
                {isAdmin && <a href="/admin.html" className="dropdown-item">⚙️ Quản trị</a>}
                <button className="dropdown-item logout" onClick={handleLogout}>Đăng xuất</button>
              </div>
            )}
          </div>
        ) : (
          <button className="btn-login" onClick={onAuthClick}>Đăng nhập</button>
        )}
      </div>
    </nav>
  )
}
EOF

# =====================
# src/components/Navbar.css
# =====================
cat > src/components/Navbar.css << 'EOF'
.navbar {
  position: sticky; top: 0; z-index: 100;
  background: #0a1628;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 1.5rem; height: 56px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.nav-brand { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 600; color: #fff; }
.nav-icon { font-size: 18px; }
.btn-login { background: #378ADD; color: #fff; border: none; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 500; cursor: pointer; }
.nav-user { position: relative; }
.nav-avatar { width: 34px; height: 34px; border-radius: 50%; background: #378ADD; color: #fff; border: none; font-size: 14px; font-weight: 600; cursor: pointer; }
.nav-dropdown { position: absolute; top: calc(100% + 8px); right: 0; background: #fff; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); min-width: 180px; overflow: hidden; }
.nav-email { font-size: 12px; color: #666; padding: 10px 14px 6px; border-bottom: 1px solid #f0f0f0; }
.dropdown-item { display: block; width: 100%; padding: 10px 14px; font-size: 14px; color: #333; background: none; border: none; text-align: left; cursor: pointer; text-decoration: none; }
.dropdown-item:hover { background: #f5f7fa; }
.dropdown-item.logout { color: #ef4444; }
EOF

# =====================
# src/components/AuthModal.jsx
# =====================
cat > src/components/AuthModal.jsx << 'EOF'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import './AuthModal.css'

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true); setError(''); setSuccess('')
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Email hoặc mật khẩu không đúng')
      else onClose()
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setSuccess('Đăng ký thành công! Kiểm tra email để xác nhận.')
    }
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-logo"><span>💻</span><span>Smartlaptop Store</span></div>
        <div className="modal-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); setSuccess('') }}>Đăng nhập</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError(''); setSuccess('') }}>Đăng ký</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Email</label><input type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div className="form-group"><label>Mật khẩu</label><input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} /></div>
          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}
          <button type="submit" className="btn-submit" disabled={loading}>{loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</button>
        </form>
      </div>
    </div>
  )
}
EOF

# =====================
# src/components/AuthModal.css
# =====================
cat > src/components/AuthModal.css << 'EOF'
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.modal-box { background: #fff; border-radius: 16px; padding: 2rem; width: 100%; max-width: 380px; position: relative; }
.modal-close { position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 18px; cursor: pointer; color: #666; }
.modal-logo { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 600; color: #0a1628; margin-bottom: 1.5rem; }
.modal-tabs { display: flex; border-bottom: 1px solid #e5e7eb; margin-bottom: 1.5rem; }
.modal-tabs button { flex: 1; background: none; border: none; padding: 0.6rem; font-size: 14px; color: #666; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; font-weight: 500; }
.modal-tabs button.active { color: #378ADD; border-bottom-color: #378ADD; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; }
.form-group input { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
.form-group input:focus { border-color: #378ADD; }
.form-error { font-size: 13px; color: #ef4444; margin-bottom: 1rem; }
.form-success { font-size: 13px; color: #22c55e; margin-bottom: 1rem; }
.btn-submit { width: 100%; background: #378ADD; color: #fff; border: none; border-radius: 8px; padding: 12px; font-size: 15px; font-weight: 500; cursor: pointer; }
.btn-submit:hover { background: #2a6bb5; }
.btn-submit:disabled { background: #93c5fd; cursor: not-allowed; }
EOF

# =====================
# src/components/ProductCard.jsx
# =====================
cat > src/components/ProductCard.jsx << 'EOF'
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
EOF

# =====================
# src/components/ProductCard.css
# =====================
cat > src/components/ProductCard.css << 'EOF'
.product-card { background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; cursor: pointer; transition: box-shadow 0.2s, transform 0.2s; }
.product-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.1); transform: translateY(-2px); }
.card-image { position: relative; height: 160px; background: #f3f4f6; overflow: hidden; }
.card-image img { width: 100%; height: 100%; object-fit: cover; }
.card-image-placeholder { height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px; }
.status-badge { position: absolute; top: 10px; right: 10px; color: #fff; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 999px; }
.card-body { padding: 14px; }
.card-name { font-size: 15px; font-weight: 600; color: #0a1628; margin: 0 0 6px; line-height: 1.3; }
.card-spec { font-size: 12px; color: #6b7280; margin: 0 0 10px; line-height: 1.5; }
.card-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 12px; }
.tag { font-size: 11px; background: #f0f4ff; color: #3b5fb5; padding: 3px 8px; border-radius: 6px; font-weight: 500; }
.card-footer { display: flex; align-items: center; justify-content: space-between; }
.card-price { font-size: 16px; font-weight: 700; color: #378ADD; margin: 0; }
.card-btn { background: #f0f7ff; color: #378ADD; border: none; border-radius: 7px; padding: 6px 12px; font-size: 12px; font-weight: 500; cursor: pointer; }
.card-btn:hover { background: #dbeafe; }
EOF

# =====================
# src/components/ProductDetail.jsx
# =====================
cat > src/components/ProductDetail.jsx << 'EOF'
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
              {product.status === 'con_hang' && <button className="btn-order" onClick={() => onOrder(product)}>🛒 Đặt hàng</button>}
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
EOF

# =====================
# src/components/ProductDetail.css
# =====================
cat > src/components/ProductDetail.css << 'EOF'
.detail-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); display: flex; align-items: center; justify-content: center; z-index: 500; padding: 1rem; }
.detail-modal { background: #fff; border-radius: 16px; width: 100%; max-width: 700px; max-height: 90vh; overflow-y: auto; position: relative; display: grid; grid-template-columns: 1fr 1fr; }
@media (max-width: 600px) { .detail-modal { grid-template-columns: 1fr; } }
.detail-close { position: absolute; top: 12px; right: 12px; z-index: 10; background: rgba(0,0,0,0.5); color: #fff; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 14px; }
.detail-gallery { background: #f3f4f6; border-radius: 16px 0 0 16px; overflow: hidden; display: flex; flex-direction: column; }
@media (max-width: 600px) { .detail-gallery { border-radius: 16px 16px 0 0; } }
.gallery-main { flex: 1; min-height: 240px; position: relative; cursor: zoom-in; overflow: hidden; }
.gallery-main img { width: 100%; height: 100%; object-fit: cover; }
.gallery-zoom { position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.4); color: #fff; border-radius: 6px; padding: 4px 8px; font-size: 13px; }
.gallery-thumbs { display: flex; gap: 6px; padding: 10px; overflow-x: auto; }
.gallery-thumbs img { width: 52px; height: 52px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent; flex-shrink: 0; }
.gallery-thumbs img.active { border-color: #378ADD; }
.gallery-empty { flex: 1; display: flex; align-items: center; justify-content: center; font-size: 64px; min-height: 240px; }
.detail-info { padding: 1.5rem; display: flex; flex-direction: column; gap: 12px; }
.detail-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.detail-header h2 { font-size: 18px; font-weight: 700; color: #0a1628; margin: 0; line-height: 1.3; }
.detail-status { font-size: 11px; color: #fff; font-weight: 600; padding: 3px 10px; border-radius: 999px; white-space: nowrap; flex-shrink: 0; }
.detail-price { font-size: 24px; font-weight: 700; color: #378ADD; margin: 0; }
.detail-specs { display: flex; flex-direction: column; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
.spec-row { display: flex; font-size: 13px; border-bottom: 1px solid #f0f0f0; }
.spec-row:last-child { border-bottom: none; }
.spec-row span:first-child { width: 90px; flex-shrink: 0; padding: 9px 12px; background: #f9fafb; color: #6b7280; font-weight: 500; border-right: 1px solid #f0f0f0; }
.spec-row span:last-child { padding: 9px 12px; color: #1f2937; }
.detail-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: auto; }
.btn-call, .btn-zalo, .btn-order { flex: 1; min-width: 90px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; border: none; text-decoration: none; }
.btn-call { background: #0a1628; color: #fff; }
.btn-zalo { background: #0068FF; color: #fff; }
.btn-order { background: #378ADD; color: #fff; }
.zoom-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 1000; display: flex; align-items: center; justify-content: center; cursor: zoom-out; }
.zoom-overlay img { max-width: 95vw; max-height: 95vh; object-fit: contain; border-radius: 8px; }
.zoom-close { position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.2); color: #fff; border: none; border-radius: 50%; width: 36px; height: 36px; font-size: 16px; cursor: pointer; }
EOF

# =====================
# src/components/OrderModal.jsx
# =====================
cat > src/components/OrderModal.jsx << 'EOF'
import { useState } from 'react'
import './OrderModal.css'

export default function OrderModal({ product, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', note: '' })
  const [success, setSuccess] = useState(false)
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  function handleSubmit(e) {
    e.preventDefault()
    const msg = `Đặt hàng: ${product['Tên sản phẩm']}\nKhách: ${form.name}\nSĐT: ${form.phone}\nGhi chú: ${form.note}`
    window.open(`https://zalo.me/0972855866?text=${encodeURIComponent(msg)}`, '_blank')
    setSuccess(true)
  }

  if (success) return (
    <div className="order-overlay" onClick={onClose}>
      <div className="order-box" onClick={e => e.stopPropagation()}>
        <div className="order-success">
          <div className="success-icon">✅</div>
          <h3>Đã mở Zalo!</h3>
          <p>Thông tin đặt hàng đã được điền sẵn. Nhấn gửi trên Zalo để hoàn tất.</p>
          <button className="btn-done" onClick={onClose}>Xong</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="order-overlay" onClick={onClose}>
      <div className="order-box" onClick={e => e.stopPropagation()}>
        <button className="order-close" onClick={onClose}>✕</button>
        <h3 className="order-title">🛒 Đặt hàng</h3>
        <p className="order-product">{product['Tên sản phẩm']}</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Họ tên *</label><input name="name" placeholder="Nguyễn Văn A" value={form.name} onChange={handleChange} required /></div>
          <div className="form-group"><label>Số điện thoại *</label><input name="phone" type="tel" placeholder="0912 345 678" value={form.phone} onChange={handleChange} required /></div>
          <div className="form-group"><label>Ghi chú</label><textarea name="note" placeholder="Yêu cầu thêm, địa chỉ giao hàng..." value={form.note} onChange={handleChange} rows={3} /></div>
          <button type="submit" className="btn-order-submit">💬 Xác nhận qua Zalo</button>
          <p className="order-note">Đơn hàng xác nhận qua Zalo · 0972 855 866</p>
        </form>
      </div>
    </div>
  )
}
EOF

# =====================
# src/components/OrderModal.css
# =====================
cat > src/components/OrderModal.css << 'EOF'
.order-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); display: flex; align-items: center; justify-content: center; z-index: 800; padding: 1rem; }
.order-box { background: #fff; border-radius: 16px; padding: 2rem; width: 100%; max-width: 400px; position: relative; }
.order-close { position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 18px; cursor: pointer; color: #666; }
.order-title { font-size: 18px; font-weight: 700; color: #0a1628; margin: 0 0 6px; }
.order-product { font-size: 14px; color: #378ADD; font-weight: 500; margin: 0 0 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #f0f0f0; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; }
.form-group input, .form-group textarea { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; font-family: inherit; resize: vertical; transition: border-color 0.2s; }
.form-group input:focus, .form-group textarea:focus { border-color: #378ADD; }
.btn-order-submit { width: 100%; background: #0068FF; color: #fff; border: none; border-radius: 8px; padding: 12px; font-size: 15px; font-weight: 500; cursor: pointer; margin-top: 0.5rem; }
.order-note { font-size: 12px; color: #9ca3af; text-align: center; margin-top: 10px; margin-bottom: 0; }
.order-success { text-align: center; padding: 1rem 0; }
.success-icon { font-size: 48px; margin-bottom: 1rem; }
.order-success h3 { font-size: 20px; font-weight: 700; margin: 0 0 8px; color: #0a1628; }
.order-success p { font-size: 14px; color: #6b7280; margin: 0 0 1.5rem; }
.btn-done { background: #378ADD; color: #fff; border: none; border-radius: 8px; padding: 10px 28px; font-size: 15px; font-weight: 500; cursor: pointer; }
EOF

# =====================
# src/pages/Home.jsx
# =====================
cat > src/pages/Home.jsx << 'EOF'
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

  const filtered = filter === 'all' ? products : products.filter(p => p.status === filter)

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

      <div className="filter-bar">
        <p className="section-label">Sản phẩm hiện có</p>
        <div className="filter-tabs">
          {FILTERS.map(f => <button key={f.key} className={filter === f.key ? 'active' : ''} onClick={() => setFilter(f.key)}>{f.label}</button>)}
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
EOF

# =====================
# src/pages/Home.css
# =====================
cat > src/pages/Home.css << 'EOF'
.gate { min-height: calc(100vh - 56px); display: flex; align-items: center; justify-content: center; padding: 2rem; background: #f5f6f8; }
.gate-box { text-align: center; max-width: 380px; }
.gate-icon { font-size: 48px; margin-bottom: 1rem; }
.gate-box h2 { font-size: 20px; font-weight: 700; color: #0a1628; margin: 0 0 8px; }
.gate-box p { font-size: 14px; color: #6b7280; margin: 0 0 1.5rem; line-height: 1.6; }
.gate-btn { background: #378ADD; color: #fff; border: none; border-radius: 10px; padding: 12px 32px; font-size: 15px; font-weight: 500; cursor: pointer; display: block; width: 100%; margin-bottom: 12px; }
.gate-contact { display: block; font-size: 14px; color: #378ADD; text-decoration: none; font-weight: 500; }
.hero { background: linear-gradient(135deg, #0a1628 0%, #1a2f4e 60%, #0f2040 100%); padding: 3rem 1.5rem; text-align: center; position: relative; overflow: hidden; }
.hero::before { content: ''; position: absolute; top: -80px; right: -80px; width: 280px; height: 280px; border-radius: 50%; background: rgba(55,138,221,0.1); pointer-events: none; }
.hero-inner { position: relative; z-index: 1; max-width: 500px; margin: 0 auto; }
.hero-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.1em; color: #5ba8f5; text-transform: uppercase; margin: 0 0 1rem; }
.hero h1 { font-size: 2rem; font-weight: 700; color: #fff; line-height: 1.25; margin: 0 0 0.75rem; }
.hero h1 span { color: #5ba8f5; }
.hero-sub { font-size: 14px; color: #7a9bbf; margin: 0 0 1.75rem; }
.hero-btns { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.hero-btn-primary, .hero-btn-outline { display: inline-flex; align-items: center; gap: 6px; padding: 11px 22px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; border: none; }
.hero-btn-primary { background: #378ADD; color: #fff; }
.hero-btn-outline { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); }
.filter-bar { padding: 1.25rem 1.5rem 0.75rem; background: #fff; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; position: sticky; top: 56px; z-index: 50; }
.section-label { font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }
.filter-tabs { display: flex; gap: 6px; }
.filter-tabs button { background: #f3f4f6; border: none; border-radius: 7px; padding: 6px 14px; font-size: 13px; color: #6b7280; cursor: pointer; font-weight: 500; transition: all 0.15s; }
.filter-tabs button.active { background: #378ADD; color: #fff; }
.products-section { padding: 1.5rem; background: #f5f6f8; min-height: 300px; }
.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
.loading-state, .empty-state { text-align: center; padding: 4rem 1rem; color: #9ca3af; font-size: 15px; }
.contact-section { padding: 1.5rem; background: #f0f4ff; }
.contact-card { background: #fff; border-radius: 12px; padding: 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; border: 1px solid #e0e7ff; max-width: 600px; margin: 0 auto; }
.contact-info { display: flex; align-items: center; gap: 12px; }
.contact-avatar { width: 44px; height: 44px; border-radius: 50%; background: #B5D4F4; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: #0C447C; flex-shrink: 0; }
.contact-name { font-size: 15px; font-weight: 600; color: #0a1628; margin: 0; }
.contact-phone { font-size: 13px; color: #6b7280; margin: 2px 0 0; }
.contact-btns { display: flex; gap: 8px; }
.btn-call, .btn-zalo { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; text-decoration: none; border: none; cursor: pointer; }
.btn-call { background: #0a1628; color: #fff; }
.btn-zalo { background: #0068FF; color: #fff; }
.footer { text-align: center; padding: 1.25rem; font-size: 12px; color: #9ca3af; background: #f5f6f8; }
EOF

echo ""
echo "✅ Xong! Toàn bộ file đã được tạo."
echo ""
echo "Chạy tiếp:"
echo "  npm run dev"
