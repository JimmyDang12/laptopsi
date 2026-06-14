#!/bin/bash
# Script tạo trang Admin cho laptopsi
# Chạy từ thư mục: ~/Desktop/laptopsi/laptopsi

echo "🚀 Đang tạo trang Admin..."

mkdir -p src/pages/Admin src/components/admin

# =====================
# src/pages/Admin/index.jsx
# =====================
cat > src/pages/Admin/index.jsx << 'EOF'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import StatsBar from '../../components/admin/StatsBar'
import ProductTable from '../../components/admin/ProductTable'
import ProductForm from '../../components/admin/ProductForm'
import OrderTable from '../../components/admin/OrderTable'
import './Admin.css'

export default function Admin() {
  const { user, isAdmin, loading } = useAuth()
  const [tab, setTab] = useState('products')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({ total: 0, con_hang: 0, da_ban: 0, dang_ve: 0 })
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (isAdmin) { fetchProducts(); fetchOrders() }
  }, [isAdmin])

  async function fetchProducts() {
    setLoadingData(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    const list = data || []
    setProducts(list)
    setStats({
      total: list.length,
      con_hang: list.filter(p => p.status === 'con_hang').length,
      da_ban: list.filter(p => p.status === 'da_ban').length,
      dang_ve: list.filter(p => p.status === 'dang_ve').length,
    })
    setLoadingData(false)
  }

  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders(data || [])
  }

  async function deleteProduct(id) {
    if (!confirm('Xoá sản phẩm này?')) return
    await supabase.from('product_images').delete().eq('product_id', id)
    await supabase.from('products').delete().eq('id', id)
    fetchProducts()
  }

  async function updateOrderStatus(id, status) {
    await supabase.from('orders').update({ status }).eq('id', id)
    fetchOrders()
  }

  if (loading) return <div className="admin-loading"><div className="spinner"></div></div>
  if (!user || !isAdmin) return (
    <div className="admin-denied">
      <h2>🔒 Không có quyền truy cập</h2>
      <p>Trang này chỉ dành cho Admin.</p>
      <a href="/">← Về trang chủ</a>
    </div>
  )

  return (
    <div className="admin">
      <div className="admin-header">
        <div className="admin-brand">
          <span>💻</span>
          <div>
            <h1>Admin Panel</h1>
            <p>Smartlaptop Store</p>
          </div>
        </div>
        <div className="admin-header-right">
          <a href="/" className="btn-view-site">← Xem trang web</a>
        </div>
      </div>

      <StatsBar stats={stats} />

      <div className="admin-tabs">
        <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>
          📦 Sản phẩm ({stats.total})
        </button>
        <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>
          🛒 Đơn hàng ({orders.length})
        </button>
      </div>

      <div className="admin-content">
        {tab === 'products' && (
          <>
            <div className="admin-toolbar">
              <button className="btn-add" onClick={() => { setEditProduct(null); setShowForm(true) }}>
                + Thêm sản phẩm
              </button>
            </div>
            {loadingData ? <div className="admin-loading-inline">Đang tải...</div> : (
              <ProductTable
                products={products}
                onEdit={p => { setEditProduct(p); setShowForm(true) }}
                onDelete={deleteProduct}
              />
            )}
          </>
        )}
        {tab === 'orders' && (
          <OrderTable orders={orders} onUpdateStatus={updateOrderStatus} />
        )}
      </div>

      {showForm && (
        <ProductForm
          product={editProduct}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchProducts() }}
        />
      )}
    </div>
  )
}
EOF

# =====================
# src/pages/Admin/Admin.css
# =====================
cat > src/pages/Admin/Admin.css << 'EOF'
.admin { min-height: 100vh; background: #f5f6f8; }

.admin-loading {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
}
.spinner { width: 36px; height: 36px; border: 3px solid #e5e7eb; border-top-color: #378ADD; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.admin-denied { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; }
.admin-denied h2 { font-size: 22px; }
.admin-denied a { color: #378ADD; text-decoration: none; font-size: 14px; }

.admin-header {
  background: #0a1628;
  padding: 0 1.5rem;
  height: 60px;
  display: flex; align-items: center; justify-content: space-between;
}
.admin-brand { display: flex; align-items: center; gap: 12px; }
.admin-brand span { font-size: 22px; }
.admin-brand h1 { font-size: 16px; font-weight: 700; color: #fff; margin: 0; }
.admin-brand p { font-size: 12px; color: #7a9bbf; margin: 0; }
.btn-view-site { color: #7a9bbf; text-decoration: none; font-size: 13px; }
.btn-view-site:hover { color: #fff; }

.admin-tabs {
  display: flex; gap: 0;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 1.5rem;
}
.admin-tabs button {
  background: none; border: none; border-bottom: 2px solid transparent;
  padding: 14px 20px; font-size: 14px; font-weight: 500; color: #6b7280;
  cursor: pointer; margin-bottom: -1px;
}
.admin-tabs button.active { color: #378ADD; border-bottom-color: #378ADD; }

.admin-content { padding: 1.5rem; max-width: 1200px; margin: 0 auto; }

.admin-toolbar { margin-bottom: 1rem; }
.btn-add {
  background: #378ADD; color: #fff; border: none; border-radius: 8px;
  padding: 10px 20px; font-size: 14px; font-weight: 500; cursor: pointer;
}
.btn-add:hover { background: #2a6bb5; }

.admin-loading-inline { padding: 3rem; text-align: center; color: #9ca3af; }
EOF

# =====================
# src/components/admin/StatsBar.jsx
# =====================
cat > src/components/admin/StatsBar.jsx << 'EOF'
import './StatsBar.css'
export default function StatsBar({ stats }) {
  const items = [
    { label: 'Tổng sản phẩm', value: stats.total, color: '#378ADD' },
    { label: 'Còn hàng', value: stats.con_hang, color: '#22c55e' },
    { label: 'Đã bán', value: stats.da_ban, color: '#ef4444' },
    { label: 'Đang về', value: stats.dang_ve, color: '#f59e0b' },
  ]
  return (
    <div className="stats-bar">
      {items.map(item => (
        <div key={item.label} className="stat-card">
          <p className="stat-value" style={{ color: item.color }}>{item.value}</p>
          <p className="stat-label">{item.label}</p>
        </div>
      ))}
    </div>
  )
}
EOF

cat > src/components/admin/StatsBar.css << 'EOF'
.stats-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; padding: 1.5rem; background: #fff; border-bottom: 1px solid #e5e7eb; }
@media (max-width: 600px) { .stats-bar { grid-template-columns: repeat(2, 1fr); } }
.stat-card { text-align: center; padding: 1rem; background: #f9fafb; border-radius: 10px; }
.stat-value { font-size: 28px; font-weight: 700; margin: 0 0 4px; }
.stat-label { font-size: 13px; color: #6b7280; margin: 0; }
EOF

# =====================
# src/components/admin/ProductTable.jsx
# =====================
cat > src/components/admin/ProductTable.jsx << 'EOF'
import './ProductTable.css'
const STATUS_MAP = { con_hang: { label: 'Còn hàng', color: '#22c55e' }, da_ban: { label: 'Đã bán', color: '#ef4444' }, dang_ve: { label: 'Đang về', color: '#f59e0b' } }

export default function ProductTable({ products, onEdit, onDelete }) {
  const formatPrice = p => p ? new Intl.NumberFormat('vi-VN').format(p) + '₫' : '—'
  if (products.length === 0) return <div className="table-empty">Chưa có sản phẩm nào. Bấm "+ Thêm sản phẩm" để bắt đầu.</div>
  return (
    <div className="table-wrap">
      <table className="product-table">
        <thead>
          <tr>
            <th>Ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Cấu hình</th>
            <th>Giá bán</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => {
            const status = STATUS_MAP[p.status] || STATUS_MAP.con_hang
            return (
              <tr key={p.id}>
                <td>
                  {p.image_url
                    ? <img src={p.image_url} alt="" className="table-img" />
                    : <div className="table-img-placeholder">💻</div>}
                </td>
                <td>
                  <p className="table-name">{p['Tên sản phẩm']}</p>
                  {p['Serial'] && <p className="table-serial">SN: {p['Serial']}</p>}
                </td>
                <td className="table-spec">{p['cấu hình'] || '—'}</td>
                <td className="table-price">{formatPrice(p['Giá bán'])}</td>
                <td><span className="status-dot" style={{ background: status.color }}>{status.label}</span></td>
                <td>
                  <div className="table-actions">
                    <button className="btn-edit" onClick={() => onEdit(p)}>✏️ Sửa</button>
                    <button className="btn-delete" onClick={() => onDelete(p.id)}>🗑️ Xoá</button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
EOF

cat > src/components/admin/ProductTable.css << 'EOF'
.table-wrap { overflow-x: auto; background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; }
.product-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.product-table th { background: #f9fafb; padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb; }
.product-table td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
.product-table tr:last-child td { border-bottom: none; }
.product-table tr:hover td { background: #fafafa; }
.table-img { width: 48px; height: 48px; object-fit: cover; border-radius: 6px; }
.table-img-placeholder { width: 48px; height: 48px; background: #f3f4f6; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
.table-name { font-weight: 600; color: #0a1628; margin: 0 0 2px; }
.table-serial { font-size: 12px; color: #9ca3af; margin: 0; }
.table-spec { color: #6b7280; max-width: 200px; }
.table-price { font-weight: 600; color: #378ADD; white-space: nowrap; }
.status-dot { display: inline-block; padding: 3px 10px; border-radius: 999px; color: #fff; font-size: 12px; font-weight: 600; }
.table-actions { display: flex; gap: 6px; }
.btn-edit, .btn-delete { border: none; border-radius: 6px; padding: 6px 12px; font-size: 12px; cursor: pointer; font-weight: 500; }
.btn-edit { background: #f0f7ff; color: #378ADD; }
.btn-edit:hover { background: #dbeafe; }
.btn-delete { background: #fef2f2; color: #ef4444; }
.btn-delete:hover { background: #fee2e2; }
.table-empty { text-align: center; padding: 4rem; color: #9ca3af; background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; }
EOF

# =====================
# src/components/admin/ProductForm.jsx
# =====================
cat > src/components/admin/ProductForm.jsx << 'EOF'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import './ProductForm.css'

const EMPTY = { 'Tên sản phẩm': '', 'cấu hình': '', 'Giá bán': '', 'Serial': '', 'Màu': '', 'Tình trạng pin': '', 'Ngoại hình': '', 'Ghi chú': '', status: 'con_hang', image_url: '' }

export default function ProductForm({ product, onClose, onSaved }) {
  const [form, setForm] = useState(product ? { ...product, 'Giá bán': product['Giá bán'] || '' } : { ...EMPTY })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isEdit = !!product

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(fileName, file)
    if (error) { setError('Upload ảnh thất bại: ' + error.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName)
    setForm(f => ({ ...f, image_url: publicUrl }))
    setUploading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true); setError('')
    const payload = { ...form, 'Giá bán': form['Giá bán'] ? Number(form['Giá bán']) : null }
    if (isEdit) {
      const { error } = await supabase.from('products').update(payload).eq('id', product.id)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('products').insert([payload])
      if (error) { setError(error.message); setSaving(false); return }
    }
    setSaving(false)
    onSaved()
  }

  return (
    <div className="form-overlay" onClick={onClose}>
      <div className="form-modal" onClick={e => e.stopPropagation()}>
        <div className="form-header">
          <h2>{isEdit ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm'}</h2>
          <button className="form-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="form-body">
          {/* Ảnh */}
          <div className="form-section">
            <label className="form-label">Ảnh sản phẩm</label>
            <div className="image-upload-area">
              {form.image_url && <img src={form.image_url} alt="" className="preview-img" />}
              <div className="upload-controls">
                <label className="btn-upload">
                  {uploading ? 'Đang upload...' : '📁 Chọn ảnh'}
                  <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
                </label>
                <span className="upload-or">hoặc</span>
                <input className="form-input" placeholder="Dán link ảnh URL" name="image_url" value={form.image_url} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group full">
              <label className="form-label">Tên sản phẩm *</label>
              <input className="form-input" name="Tên sản phẩm" value={form['Tên sản phẩm']} onChange={handleChange} required placeholder="Surface Pro 9 i5/8/256" />
            </div>
            <div className="form-group full">
              <label className="form-label">Cấu hình</label>
              <input className="form-input" name="cấu hình" value={form['cấu hình']} onChange={handleChange} placeholder="Intel Core i5, RAM 8GB, SSD 256GB" />
            </div>
            <div className="form-group">
              <label className="form-label">Giá bán (₫)</label>
              <input className="form-input" name="Giá bán" type="number" value={form['Giá bán']} onChange={handleChange} placeholder="18500000" />
            </div>
            <div className="form-group">
              <label className="form-label">Trạng thái</label>
              <select className="form-input" name="status" value={form.status} onChange={handleChange}>
                <option value="con_hang">Còn hàng</option>
                <option value="da_ban">Đã bán</option>
                <option value="dang_ve">Đang về</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Serial</label>
              <input className="form-input" name="Serial" value={form['Serial']} onChange={handleChange} placeholder="SN123456" />
            </div>
            <div className="form-group">
              <label className="form-label">Màu</label>
              <input className="form-input" name="Màu" value={form['Màu']} onChange={handleChange} placeholder="Platinum, Black..." />
            </div>
            <div className="form-group">
              <label className="form-label">Tình trạng pin</label>
              <input className="form-input" name="Tình trạng pin" value={form['Tình trạng pin']} onChange={handleChange} placeholder="99%, Like New..." />
            </div>
            <div className="form-group">
              <label className="form-label">Ngoại hình</label>
              <input className="form-input" name="Ngoại hình" value={form['Ngoại hình']} onChange={handleChange} placeholder="Like New 99%, 98%..." />
            </div>
            <div className="form-group full">
              <label className="form-label">Ghi chú</label>
              <textarea className="form-input" name="Ghi chú" value={form['Ghi chú']} onChange={handleChange} rows={3} placeholder="Thông tin thêm..." />
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Đang lưu...' : isEdit ? '💾 Lưu thay đổi' : '➕ Thêm sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
EOF

cat > src/components/admin/ProductForm.css << 'EOF'
.form-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 900; padding: 1rem; }
.form-modal { background: #fff; border-radius: 16px; width: 100%; max-width: 640px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; }
.form-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e5e7eb; flex-shrink: 0; }
.form-header h2 { font-size: 17px; font-weight: 700; color: #0a1628; margin: 0; }
.form-close { background: none; border: none; font-size: 18px; cursor: pointer; color: #666; }
.form-body { padding: 1.5rem; overflow-y: auto; flex: 1; }
.form-section { margin-bottom: 1.25rem; }
.form-label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; }
.form-input { width: 100%; padding: 9px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; font-family: inherit; transition: border-color 0.2s; }
.form-input:focus { border-color: #378ADD; }
.image-upload-area { display: flex; gap: 12px; align-items: flex-start; flex-wrap: wrap; }
.preview-img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb; flex-shrink: 0; }
.upload-controls { display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 200px; }
.btn-upload { background: #f3f4f6; color: #374151; border: 1px dashed #d1d5db; border-radius: 8px; padding: 8px 16px; font-size: 13px; cursor: pointer; text-align: center; font-weight: 500; }
.btn-upload:hover { background: #e5e7eb; }
.upload-or { font-size: 12px; color: #9ca3af; text-align: center; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; }
.form-group.full { grid-column: 1 / -1; }
.form-error { font-size: 13px; color: #ef4444; margin: 0.5rem 0; }
.form-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; }
.btn-cancel { background: #f3f4f6; color: #374151; border: none; border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 500; cursor: pointer; }
.btn-save { background: #378ADD; color: #fff; border: none; border-radius: 8px; padding: 10px 24px; font-size: 14px; font-weight: 500; cursor: pointer; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
EOF

# =====================
# src/components/admin/OrderTable.jsx
# =====================
cat > src/components/admin/OrderTable.jsx << 'EOF'
import './OrderTable.css'

const STATUS_MAP = {
  pending: { label: 'Chờ xử lý', color: '#f59e0b' },
  confirmed: { label: 'Đã xác nhận', color: '#22c55e' },
  cancelled: { label: 'Đã huỷ', color: '#ef4444' },
}

export default function OrderTable({ orders, onUpdateStatus }) {
  function formatDate(str) {
    return new Date(str).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (orders.length === 0) return (
    <div className="order-empty">Chưa có đơn hàng nào.</div>
  )

  return (
    <div className="table-wrap">
      <table className="order-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Sản phẩm</th>
            <th>Khách hàng</th>
            <th>SĐT</th>
            <th>Ghi chú</th>
            <th>Thời gian</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o, i) => {
            const status = STATUS_MAP[o.status] || STATUS_MAP.pending
            return (
              <tr key={o.id}>
                <td className="order-id">#{orders.length - i}</td>
                <td className="order-product">{o.product_name || '—'}</td>
                <td className="order-customer">{o.customer_name}</td>
                <td><a href={`tel:${o.customer_phone}`} className="order-phone">{o.customer_phone}</a></td>
                <td className="order-note">{o.note || '—'}</td>
                <td className="order-date">{formatDate(o.created_at)}</td>
                <td><span className="order-status" style={{ background: status.color }}>{status.label}</span></td>
                <td>
                  <select className="status-select" value={o.status} onChange={e => onUpdateStatus(o.id, e.target.value)}>
                    <option value="pending">Chờ xử lý</option>
                    <option value="confirmed">Xác nhận</option>
                    <option value="cancelled">Huỷ</option>
                  </select>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
EOF

cat > src/components/admin/OrderTable.css << 'EOF'
.order-empty { text-align: center; padding: 4rem; color: #9ca3af; background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; }
.table-wrap { overflow-x: auto; background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; }
.order-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.order-table th { background: #f9fafb; padding: 11px 14px; text-align: left; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb; white-space: nowrap; }
.order-table td { padding: 11px 14px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
.order-table tr:last-child td { border-bottom: none; }
.order-table tr:hover td { background: #fafafa; }
.order-id { font-weight: 700; color: #6b7280; }
.order-product { font-weight: 600; color: #0a1628; max-width: 160px; }
.order-customer { font-weight: 500; }
.order-phone { color: #378ADD; text-decoration: none; font-weight: 500; }
.order-note { color: #6b7280; max-width: 150px; }
.order-date { color: #6b7280; white-space: nowrap; font-size: 12px; }
.order-status { display: inline-block; padding: 3px 10px; border-radius: 999px; color: #fff; font-size: 11px; font-weight: 600; white-space: nowrap; }
.status-select { border: 1px solid #d1d5db; border-radius: 6px; padding: 5px 8px; font-size: 12px; cursor: pointer; background: #fff; outline: none; }
.status-select:focus { border-color: #378ADD; }
EOF

echo ""
echo "✅ Xong! Trang Admin đã được tạo."
echo ""
echo "Bước tiếp theo:"
echo "1. Chạy SQL trong Supabase để tạo bảng orders"
echo "2. Cập nhật App.jsx để thêm route /admin"
echo "3. npm run dev để test"
