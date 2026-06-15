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

    try {
      // First check if customer exists by phone
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', form.phone)
        .single()

      let customerId = existingCustomer?.id

      // If customer doesn't exist, insert new one
      if (!customerId) {
        const { data: newCustomer, error: insertError } = await supabase
          .from('customers')
          .insert([{
            phone: form.phone,
            name: form.name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select('id')
          .single()

        if (insertError) throw insertError
        customerId = newCustomer?.id
      } else {
        // Update existing customer
        await supabase
          .from('customers')
          .update({ name: form.name, updated_at: new Date().toISOString() })
          .eq('id', customerId)
      }

      // Save order to Supabase
      const payload = {
        product_id: product.id || null,
        product_name: product['Tên sản phẩm'] || null,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_id: customerId,
        note: form.note || null,
        status: 'pending'
      }
      if (user && user.id) payload.user_id = user.id

      const { error } = await supabase.from('orders').insert([payload])
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
          <h3>Đơn hàng đã được lưu!</h3>
          <p>Thông tin đơn hàng đã được lưu vào hệ thống. Admin sẽ liên hệ bạn sớm nhất.</p>
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
          <button type="submit" className="btn-order-submit" disabled={loading}>{loading ? 'Đang gửi...' : '✅ Xác nhận đặt hàng'}</button>
          <p className="order-note">Đơn hàng sẽ được xử lý bởi admin</p>
        </form>
      </div>
    </div>
  )
}
