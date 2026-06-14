import { useState } from 'react'
import './OrderModal.css'

export default function OrderModal({ product, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', note: '' })
  const [success, setSuccess] = useState(false)
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  function handleSubmit(e) {
    e.preventDefault()
    const msg = `Đặt hàng: ${product['Tên sản phẩm']}\nKhách: ${form.name}\nSĐT: ${form.phone}\nGhi chú: ${form.note}`
    window.open(`https://zalo.me/0972855866?text=${encodeURIComponent(msg)}`, '_blank')
    setSuccess(true)
  }

  if (success) return (
    <div className="order-overlay" onClick={onClose}>
      <div className="order-box" onClick={e => e.stopPropagation()}>
        <div className="order-success">
          <div className="success-icon">✅</div>
          <h3>Đã mở Zalo!</h3>
          <p>Thông tin đặt hàng đã được điền sẵn. Nhấn gửi trên Zalo để hoàn tất.</p>
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
          <button type="submit" className="btn-order-submit">💬 Xác nhận qua Zalo</button>
          <p className="order-note">Đơn hàng xác nhận qua Zalo · 0972 855 866</p>
        </form>
      </div>
    </div>
  )
}
