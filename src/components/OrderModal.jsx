import { useState } from 'react'
import './OrderModal.css'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function OrderModal({ product, onClose }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', phone: '', note: '' })
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    // Prepare message and open Zalo as before
    const msg = `Đặt hàng: ${product['Tên sản phẩm']}\nKhách: ${form.name}\nSĐT: ${form.phone}\nGhi chú: ${form.note}`
    window.open(`https://zalo.me/0972855866?text=${encodeURIComponent(msg)}`, '_blank')

    // Save/upsert customer and then save order
    try {
      // Upsert customer by phone
      const customerPayload = {
        phone: form.phone,
        name: form.name,
        updated_at: new Date().toISOString()
      }
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .upsert([customerPayload], { onConflict: 'phone' })
        .select()
        .single()

      if (customerError) {
        console.warn('Cảnh báo: không thể lưu/cập nhật khách hàng:', customerError)
        // Không throw — vẫn lưu order ngay cả khi customer save thất bại
      }

      // Save order to Supabase
      const payload = {
        product_id: product.id || null,
        product_name: product['Tên sản phẩm'] || null,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_id: customerData?.id || null,
        note: form.note || null,
        status: 'pending'
      }
      // If user is logged in, attach user id
      if (user && user.id) payload.user_id = user.id

      const { error } = await supabase.from('orders').insert([payload]).select().single()
      if (error) throw error
      setSuccess(true)
    } catch (err) {
      console.error('Lỗi lưu đơn hàng:', err)
      alert('Không thể lưu đơn hàng. Vui lòng thử lại hoặc liên hệ cửa hàng.')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="order-overlay" onClick={onClose}>
      <div className="order-box" onClick={e => e.stopPropagation()}>
        <div className="order-success">
          <div className="success-icon">✅</div>
          <h3>Đã mở Zalo!</h3>
          <p>Thông tin đặt hàng đã được điền sẵn và đã lưu vào hệ thống. Nhấn gửi trên Zalo để hoàn tất.</p>
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
          <button type="submit" className="btn-order-submit" disabled={loading}>{loading ? 'Đang gửi...' : '💬 Xác nhận qua Zalo'}</button>
          <p className="order-note">Đơn hàng xác nhận qua Zalo · 0972 855 866</p>
        </form>
      </div>
    </div>
  )
}
