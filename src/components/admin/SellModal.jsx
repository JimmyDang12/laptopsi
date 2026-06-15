import { useState, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import './SellModal.css'

export default function SellModal({ product, customers = [], onClose, onSold }) {
  const [mode, setMode] = useState('existing') // 'existing' | 'new'
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' })
  const [note, setNote] = useState('')
  const [salePrice, setSalePrice] = useState(product?.['Giá bán'] ?? '')
  const [loading, setLoading] = useState(false)

  const price = salePrice === '' ? 0 : Number(salePrice)
  const formatPrice = p => p ? new Intl.NumberFormat('vi-VN').format(p) + '₫' : '—'

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    )
  }, [customers, search])

  const handleNewChange = e => setNewCustomer({ ...newCustomer, [e.target.name]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const now = new Date().toISOString()
      let customer

      if (mode === 'new') {
        if (!newCustomer.name || !newCustomer.phone) {
          throw new Error('Vui lòng nhập tên và số điện thoại khách hàng')
        }
        const { data, error } = await supabase
          .from('customers')
          .insert([{
            name: newCustomer.name,
            phone: newCustomer.phone,
            email: newCustomer.email || null,
            address: newCustomer.address || null,
            created_at: now,
            updated_at: now
          }])
          .select()
          .single()
        if (error) throw error
        customer = data
      } else {
        if (!selectedId) throw new Error('Vui lòng chọn khách hàng')
        customer = customers.find(c => String(c.id) === String(selectedId))
        if (!customer) throw new Error('Không tìm thấy khách hàng đã chọn')
      }

      // 1. Lưu đơn hàng (lịch sử mua) — đánh dấu đã xác nhận vì admin ghi nhận giao dịch thực
      const { error: orderError } = await supabase.from('orders').insert([{
        product_id: product.id || null,
        product_name: product['Tên sản phẩm'] || null,
        customer_id: customer.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        note: `Bán trực tiếp · ${formatPrice(price)}${note ? ' · ' + note : ''}`,
        status: 'confirmed',
        created_at: now
      }])
      if (orderError) throw orderError

      // 2. Chuyển sản phẩm: còn hàng -> đã bán, cập nhật giá bán thực tế
      const { error: productError } = await supabase
        .from('products')
        .update({ status: 'da_ban', 'Giá bán': price || null })
        .eq('id', product.id)
      if (productError) throw productError

      // 3. Cập nhật thống kê khách hàng
      const { error: customerError } = await supabase
        .from('customers')
        .update({
          total_orders: (customer.total_orders || 0) + 1,
          total_spent: (customer.total_spent || 0) + (price || 0),
          updated_at: now
        })
        .eq('id', customer.id)
      if (customerError) throw customerError

      alert('✅ Đã bán sản phẩm và lưu vào lịch sử khách hàng')
      onClose()
      if (onSold) onSold()
    } catch (err) {
      console.error('Lỗi bán sản phẩm:', err)
      alert('❌ ' + (err.message || 'Không thể hoàn tất giao dịch'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box sell-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>💰 Bán sản phẩm</h2>

        <div className="sell-product">
          <div className="sell-product-name">{product['Tên sản phẩm']}</div>
          <div className="sell-product-listed">Giá niêm yết: {formatPrice(product['Giá bán'])}</div>
          {product['Serial'] && <div className="sell-product-serial">SN: {product['Serial']}</div>}
        </div>

        <div className="sell-tabs">
          <button
            type="button"
            className={mode === 'existing' ? 'active' : ''}
            onClick={() => setMode('existing')}
          >Khách có sẵn</button>
          <button
            type="button"
            className={mode === 'new' ? 'active' : ''}
            onClick={() => setMode('new')}
          >Khách mới</button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'existing' ? (
            <>
              <div className="form-group">
                <label>Tìm khách hàng</label>
                <input
                  placeholder="Tên, SĐT hoặc email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Chọn khách hàng *</label>
                <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="sell-select">
                  <option value="">— Chọn khách —</option>
                  {filtered.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.phone}
                    </option>
                  ))}
                </select>
                {filtered.length === 0 && (
                  <small className="sell-hint">Không tìm thấy khách. Chuyển sang "Khách mới" để thêm.</small>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Tên khách hàng *</label>
                <input name="name" placeholder="Nguyễn Văn A" value={newCustomer.name} onChange={handleNewChange} />
              </div>
              <div className="form-group">
                <label>Số điện thoại *</label>
                <input name="phone" type="tel" placeholder="0912345678" value={newCustomer.phone} onChange={handleNewChange} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" placeholder="abc@example.com" value={newCustomer.email} onChange={handleNewChange} />
              </div>
              <div className="form-group">
                <label>Địa chỉ</label>
                <input name="address" placeholder="123 Đường ABC, Quận 1" value={newCustomer.address} onChange={handleNewChange} />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Giá bán thực tế (₫) *</label>
            <input
              type="number"
              min="0"
              placeholder="VD: 18000000"
              value={salePrice}
              onChange={e => setSalePrice(e.target.value)}
              required
            />
            <small className="sell-hint">Giá có thể chỉnh linh hoạt — sẽ ghi vào lịch sử: {formatPrice(price)}</small>
          </div>

          <div className="form-group">
            <label>Ghi chú giao dịch</label>
            <textarea
              placeholder="Hình thức thanh toán, ưu đãi, bảo hành..."
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Đang xử lý...' : '✅ Xác nhận bán'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
