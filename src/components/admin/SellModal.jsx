import { useState, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import './SellModal.css'

export default function SellModal({ product, customers = [], staff = [], onClose, onSold }) {
  const [mode, setMode] = useState('existing') // 'existing' | 'new'
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' })
  const [note, setNote] = useState('')
  const [salePrice, setSalePrice] = useState(product?.['Giá bán'] ?? '')
  const [staffId, setStaffId] = useState('')
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

      // 1. Lưu đơn hàng (lịch sử mua) — trạng thái chờ xử lý
      const orderPayload = {
        product_id: product.id || null,
        product_name: product['Tên sản phẩm'] || null,
        customer_id: customer.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        note: `Bán trực tiếp · ${formatPrice(price)}${note ? ' · ' + note : ''}`,
        status: 'pending',
        created_at: now
      }
      if (staffId) orderPayload.staff_id = Number(staffId)

      const { error: orderError } = await supabase.from('orders').insert([orderPayload])
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

        <form onSubmit={handleSubmit}>
          <div className="sell-cols">
            {/* Khách có sẵn — bên trái */}
            <div className={`sell-col ${mode === 'existing' ? 'active' : ''}`} onClick={() => setMode('existing')}>
              <div className="sell-col-head">
                <span className="sell-radio">{mode === 'existing' ? '●' : '○'}</span> Khách có sẵn
              </div>
              <div className="form-group">
                <input
                  placeholder="🔍 Tìm tên, SĐT, email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={() => setMode('existing')}
                />
              </div>
              <div className="form-group">
                <select
                  value={selectedId}
                  onChange={e => setSelectedId(e.target.value)}
                  onFocus={() => setMode('existing')}
                  className="sell-select"
                  size={5}
                >
                  {filtered.map(c => (
                    <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>
                  ))}
                </select>
                {filtered.length === 0 && <small className="sell-hint">Không tìm thấy khách phù hợp.</small>}
              </div>
            </div>

            {/* Khách mới — bên phải */}
            <div className={`sell-col ${mode === 'new' ? 'active' : ''}`} onClick={() => setMode('new')}>
              <div className="sell-col-head">
                <span className="sell-radio">{mode === 'new' ? '●' : '○'}</span> Khách mới
              </div>
              <div className="form-group">
                <input name="name" placeholder="Tên khách *" value={newCustomer.name} onChange={handleNewChange} onFocus={() => setMode('new')} />
              </div>
              <div className="form-group">
                <input name="phone" type="tel" placeholder="Số điện thoại *" value={newCustomer.phone} onChange={handleNewChange} onFocus={() => setMode('new')} />
              </div>
              <div className="form-group">
                <input name="email" type="email" placeholder="Email" value={newCustomer.email} onChange={handleNewChange} onFocus={() => setMode('new')} />
              </div>
              <div className="form-group">
                <input name="address" placeholder="Địa chỉ" value={newCustomer.address} onChange={handleNewChange} onFocus={() => setMode('new')} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Nhân viên phụ trách</label>
            <select className="sell-select" value={staffId} onChange={e => setStaffId(e.target.value)}>
              <option value="">— Chọn nhân viên —</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {staff.length === 0 && <small className="sell-hint">Chưa có nhân viên. Thêm ở tab "Nhân viên".</small>}
          </div>

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
