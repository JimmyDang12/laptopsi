import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import './CustomerDetail.css'

export default function CustomerDetail({ customer, onClose, onCustomerUpdated }) {
  const [orders, setOrders] = useState([])
  const [adminNotes, setAdminNotes] = useState(customer?.admin_notes || '')
  const [loading, setLoading] = useState(true)
  const [savingNotes, setSavingNotes] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [customer?.id])

  async function fetchOrders() {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  async function saveNotes() {
    setSavingNotes(true)
    try {
      const { error } = await supabase
        .from('customers')
        .update({ admin_notes: adminNotes })
        .eq('id', customer.id)
      if (error) throw error
      if (onCustomerUpdated) onCustomerUpdated()
      alert('✅ Ghi chú đã lưu')
    } catch (err) {
      console.error('Lỗi lưu ghi chú:', err)
      alert('❌ Không thể lưu ghi chú')
    } finally {
      setSavingNotes(false)
    }
  }

  function formatDate(str) {
    return new Date(str).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  function formatCurrency(num) {
    return new Intl.NumberFormat('vi-VN').format(num) + '₫'
  }

  const statusMap = {
    pending: { label: 'Chờ xử lý', color: '#f59e0b' },
    confirmed: { label: 'Đã xác nhận', color: '#22c55e' },
    cancelled: { label: 'Đã huỷ', color: '#ef4444' },
  }

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-modal large" onClick={e => e.stopPropagation()}>
        <button className="detail-close" onClick={onClose}>✕</button>

        {/* Customer Info */}
        <div className="customer-info-section">
          <h2>👤 {customer.name}</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Số điện thoại</span>
              <a href={`tel:${customer.phone}`}>{customer.phone}</a>
            </div>
            <div className="info-item">
              <span className="label">Email</span>
              <span>{customer.email || '—'}</span>
            </div>
            <div className="info-item">
              <span className="label">Địa chỉ</span>
              <span>{customer.address || '—'}</span>
            </div>
            <div className="info-item">
              <span className="label">Số đơn</span>
              <span>{customer.total_orders || 0}</span>
            </div>
            <div className="info-item">
              <span className="label">Tổng chi</span>
              <span>{formatCurrency(customer.total_spent || 0)}</span>
            </div>
            <div className="info-item">
              <span className="label">Ngày tạo</span>
              <span>{formatDate(customer.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Admin Notes */}
        <div className="admin-notes-section">
          <h3>📝 Ghi chú Admin</h3>
          <textarea
            value={adminNotes}
            onChange={e => setAdminNotes(e.target.value)}
            placeholder="Ghi chú về khách, quá trình giao dịch, vấn đề cần lưu ý..."
            rows={4}
            className="notes-textarea"
          />
          <button
            className="btn-save-notes"
            onClick={saveNotes}
            disabled={savingNotes}
          >
            {savingNotes ? '⏳ Đang lưu...' : '💾 Lưu ghi chú'}
          </button>
        </div>

        {/* Purchase History */}
        <div className="purchase-history-section">
          <h3>📦 Lịch sử mua hàng ({orders.length})</h3>
          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : orders.length === 0 ? (
            <div className="empty">Chưa có đơn hàng</div>
          ) : (
            <div className="orders-list">
              {orders.map((o, i) => {
                const status = statusMap[o.status] || statusMap.pending
                return (
                  <div key={o.id} className="order-item">
                    <div className="order-header">
                      <span className="order-number">#{orders.length - i}</span>
                      <span className="order-product">{o.product_name}</span>
                      <span className="order-status" style={{ background: status.color }}>{status.label}</span>
                      <span className="order-date">{formatDate(o.created_at)}</span>
                    </div>
                    {o.note && <div className="order-note">{o.note}</div>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
