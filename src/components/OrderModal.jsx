import { useState } from 'react'
import './OrderModal.css'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function OrderModal({ product, onClose }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ address: '', note: '' })
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      // Get customer info from user metadata (set during auth)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      const userPhone = authUser?.phone || authUser?.user_metadata?.phone
      const userName = authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0]

      // Check if customer exists by phone
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id, admin_notes')
        .eq('phone', userPhone)
        .single()

      let customerId = existingCustomer?.id
      let existingNotes = existingCustomer?.admin_notes || ''

      // If customer doesn't exist, insert new one
      if (!customerId) {
        const { data: newCustomer, error: insertError } = await supabase
          .from('customers')
          .insert([{
            phone: userPhone,
            name: userName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select('id')
          .single()

        if (insertError) throw insertError
        customerId = newCustomer?.id
        existingNotes = ''
      } else {
        // Update existing customer
        await supabase
          .from('customers')
          .update({ name: userName, updated_at: new Date().toISOString() })
          .eq('id', customerId)
      }

      // Build order note with timestamp
      const timestamp = new Date().toLocaleString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
      
      const orderNote = `📍 ${form.address}${form.note ? '\n💬 ' + form.note : ''}`
      
      // Auto-save to admin_notes with timestamp
      const newAdminNotes = existingNotes 
        ? `${existingNotes}\n\n[${timestamp}] ${product['Tên sản phẩm']}\n${orderNote}`
        : `[${timestamp}] ${product['Tên sản phẩm']}\n${orderNote}`

      await supabase
        .from('customers')
        .update({ admin_notes: newAdminNotes })
        .eq('id', customerId)

      // Save order to Supabase
      const payload = {
        product_id: product.id || null,
        product_name: product['Tên sản phẩm'] || null,
        customer_name: userName,
        customer_phone: userPhone,
        customer_id: customerId,
        note: `Địa chỉ: ${form.address}${form.note ? '\n' + form.note : ''}`,
        status: 'pending'
      }
      if (user && user.id) payload.user_id = user.id

      const { error } = await supabase.from('orders').insert([payload])
      if (error) throw error
      setSuccess(true)
    } catch (err) {
      console.error('Lỗi lưu đơn hàng:', err)
      alert('❌ Không thể lưu đơn hàng. Vui lòng thử lại hoặc liên hệ cửa hàng.')
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
          <div className="form-group"><label>Địa chỉ giao hàng *</label><input name="address" placeholder="123 Đường ABC, Quận 1, TP HCM" value={form.address} onChange={handleChange} required /></div>
          <div className="form-group"><label>Ghi chú thêm</label><textarea name="note" placeholder="Yêu cầu đặc biệt, thời gian giao hàng..." value={form.note} onChange={handleChange} rows={3} /></div>
          <button type="submit" className="btn-order-submit" disabled={loading}>{loading ? 'Đang gửi...' : '✅ Xác nhận đặt hàng'}</button>
          <p className="order-note">Thông tin sẽ được lưu vào lịch sử mua hàng</p>
        </form>
      </div>
    </div>
  )
}
