import ImportExcel from '../../components/admin/ImportExcel'
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
  const [showImport, setShowImport] = useState(false)
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
              <button className="btn-import-excel" onClick={() => setShowImport(true)}>
                📥 Import Excel
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
      {showImport && (
  <ImportExcel
    onClose={() => setShowImport(false)}
    onImported={fetchProducts}
  />
      )}
    </div>
  )
}
