import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import './AddCustomerModal.css'

export default function AddCustomerModal({ onClose, onCustomerAdded, currentUserId }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', note: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      if (!form.name || !form.phone) {
        throw new Error('Vui lòng nhập tên và số điện thoại')
      }

      const { error } = await supabase.from('customers').insert([{
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        address: form.address || null,
        note: form.note || null,
        created_by: currentUserId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])

      if (error) throw error
      alert('✅ Khách hàng đã thêm')
      onClose()
      if (onCustomerAdded) onCustomerAdded()
    } catch (err) {
      console.error('Lỗi thêm khách:', err)
      alert('❌ ' + (err.message || 'Không thể thêm khách hàng'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>➕ Thêm khách hàng</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên khách hàng *</label>
            <input 
              name="name" 
              placeholder="Nguyễn Văn A" 
              value={form.name} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Số điện thoại *</label>
            <input 
              name="phone" 
              type="tel"
              placeholder="0912345678" 
              value={form.phone} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input 
              name="email" 
              type="email"
              placeholder="abc@example.com" 
              value={form.email} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label>Địa chỉ</label>
            <input 
              name="address" 
              placeholder="123 Đường ABC, Quận 1, TP HCM" 
              value={form.address} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label>Ghi chú</label>
            <textarea 
              name="note" 
              placeholder="Thông tin thêm về khách..."
              value={form.note} 
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Đang thêm...' : '✅ Thêm khách hàng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
