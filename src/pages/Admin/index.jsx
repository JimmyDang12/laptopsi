import ImportExcel from '../../components/admin/ImportExcel'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import StatsBar from '../../components/admin/StatsBar'
import ProductTable from '../../components/admin/ProductTable'
import ProductDetail from '../../components/ProductDetail'
import OrderModal from '../../components/OrderModal'
import ProductForm from '../../components/admin/ProductForm'
import OrderTable from '../../components/admin/OrderTable'
import CustomerTable from '../../components/admin/CustomerTable'
import CustomerDetail from '../../components/admin/CustomerDetail'
import AddCustomerModal from '../../components/admin/AddCustomerModal'
import SellModal from '../../components/admin/SellModal'
import NotificationBell from '../../components/admin/NotificationBell'
import './Admin.css'

export default function Admin() {
  const { user, isAdmin, loading } = useAuth()
  const [tab, setTab] = useState('products')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [stats, setStats] = useState({ total: 0, con_hang: 0, da_ban: 0, dang_ve: 0 })
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [selected, setSelected] = useState(null)
  const [selectedImages, setSelectedImages] = useState([])
  const [orderProduct, setOrderProduct] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [sellProduct, setSellProduct] = useState(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (isAdmin) { fetchProducts(); fetchOrders(); fetchCustomers() }
  }, [isAdmin])

  // Lắng nghe đơn hàng mới theo thời gian thực để cập nhật thông báo
  useEffect(() => {
    if (!isAdmin) return
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
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

  async function fetchCustomers() {
    const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false })
    setCustomers(data || [])
  }

  async function deleteProduct(id) {
    const product = products.find(p => p.id === id)
    if (product?.status === 'da_ban') {
      alert('🔒 Sản phẩm đã bán không thể xoá để giữ lịch sử giao dịch.')
      return
    }
    if (!confirm('Xoá sản phẩm này?')) return
    // Gỡ liên kết ở đơn hàng để tránh lỗi khoá ngoại (lịch sử mua vẫn giữ vì đã lưu tên sản phẩm)
    const { error: unlinkError } = await supabase.from('orders').update({ product_id: null }).eq('product_id', id)
    if (unlinkError) {
      alert('❌ Không thể gỡ liên kết đơn hàng: ' + unlinkError.message)
      return
    }
    await supabase.from('product_images').delete().eq('product_id', id)
    const { data, error } = await supabase.from('products').delete().eq('id', id).select()
    if (error) {
      alert('❌ Không thể xoá sản phẩm: ' + error.message)
      return
    }
    if (!data || data.length === 0) {
      alert('❌ Không xoá được sản phẩm. Có thể do quyền (RLS) của bảng products trong Supabase chưa cho phép xoá.')
      return
    }
    fetchProducts()
  }

  async function openDetail(product) {
    setSelected(product)
    const { data } = await supabase.from('product_images').select('*').eq('product_id', product.id).order('order')
    setSelectedImages(data || [])
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
          <NotificationBell orders={orders} onOpenOrders={() => setTab('orders')} />
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
        <button className={tab === 'customers' ? 'active' : ''} onClick={() => setTab('customers')}>
          👥 Khách hàng ({customers.length})
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
                onView={openDetail}
                onSell={setSellProduct}
              />
            )}
          </>
        )}
        {tab === 'orders' && (
          <OrderTable orders={orders} onUpdateStatus={updateOrderStatus} />
        )}
        {tab === 'customers' && (
          <>
            <div className="admin-toolbar">
              <button className="btn-add" onClick={() => setShowAddCustomer(true)}>
                + Thêm khách hàng
              </button>
            </div>
            <CustomerTable customers={customers} onViewCustomer={setSelectedCustomer} />
          </>
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
      {selected && <ProductDetail product={selected} images={selectedImages} onClose={() => setSelected(null)} onOrder={(p) => { setSelected(null); setOrderProduct(p) }} />}
      {orderProduct && <OrderModal product={orderProduct} onClose={() => setOrderProduct(null)} />}
      {selectedCustomer && <CustomerDetail customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} onCustomerUpdated={fetchCustomers} />}
      {showAddCustomer && (
        <AddCustomerModal
          onClose={() => setShowAddCustomer(false)}
          onCustomerAdded={fetchCustomers}
        />
      )}
      {sellProduct && (
        <SellModal
          product={sellProduct}
          customers={customers}
          onClose={() => setSellProduct(null)}
          onSold={() => { fetchProducts(); fetchOrders(); fetchCustomers() }}
        />
      )}
    </div>
  )
}
