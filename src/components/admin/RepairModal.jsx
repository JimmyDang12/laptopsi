import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import './RepairModal.css'

export default function RepairModal({ product, onClose }) {
  const [repairs, setRepairs] = useState([])
  const [form, setForm] = useState({ content: '', cost: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchRepairs() }, [product?.id])

  async function fetchRepairs() {
    setLoading(true)
    const { data, error } = await supabase
      .from('repairs')
      .select('*')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false })
    if (error) console.warn('Chưa có bảng repairs (cần chạy SQL):', error.message)
    setRepairs(data || [])
    setLoading(false)
  }

  async function addRepair(e) {
    e.preventDefault()
    if (!form.content.trim()) { alert('⚠️ Vui lòng nhập nội dung sửa chữa'); return }
    setSaving(true)
    try {
      const { error } = await supabase.from('repairs').insert([{
        product_id: product.id,
        content: form.content.trim(),
        cost: form.cost === '' ? null : Number(form.cost),
        created_at: new Date().toISOString()
      }])
      if (error) throw error
      setForm({ content: '', cost: '' })
      fetchRepairs()
    } catch (err) {
      console.error('Lỗi thêm sửa chữa:', err)
      alert('❌ ' + (err.message || 'Không thể lưu'))
    } finally {
      setSaving(false)
    }
  }

  async function deleteRepair(id) {
    if (!confirm('Xoá mục sửa chữa này?')) return
    await supabase.from('repairs').delete().eq('id', id)
    fetchRepairs()
  }

  function formatCurrency(n) {
    return n != null ? new Intl.NumberFormat('vi-VN').format(n) + '₫' : '—'
  }
  function formatDate(str) {
    return new Date(str).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const totalCost = repairs.reduce((sum, r) => sum + (r.cost || 0), 0)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box repair-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>🔧 Lịch sử sửa chữa</h2>
        <p className="repair-product">{product['Tên sản phẩm']}{product['Serial'] ? ` · SN: ${product['Serial']}` : ''}</p>

        <form className="repair-add" onSubmit={addRepair}>
          <textarea
            placeholder="Nội dung sửa chữa / tân trang (VD: thay pin, vệ sinh, sơn lại vỏ...)"
            value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
            rows={2}
          />
          <div className="repair-add-foot">
            <input
              type="number"
              min="0"
              placeholder="Chi phí (₫)"
              value={form.cost}
              onChange={e => setForm({ ...form, cost: e.target.value })}
            />
            <button type="submit" className="btn-submit" disabled={saving}>
              {saving ? 'Đang lưu...' : '+ Thêm'}
            </button>
          </div>
        </form>

        <div className="repair-list-head">
          <span>Lịch sử ({repairs.length})</span>
          {totalCost > 0 && <span className="repair-total">Tổng chi phí: {formatCurrency(totalCost)}</span>}
        </div>

        {loading ? (
          <div className="repair-empty">Đang tải...</div>
        ) : repairs.length === 0 ? (
          <div className="repair-empty">Chưa có lịch sử sửa chữa.</div>
        ) : (
          <div className="repair-list">
            {repairs.map(r => (
              <div key={r.id} className="repair-item">
                <div className="repair-item-main">
                  <div className="repair-content">{r.content}</div>
                  <div className="repair-meta">{formatDate(r.created_at)}{r.cost != null ? ` · ${formatCurrency(r.cost)}` : ''}</div>
                </div>
                <button className="repair-del" onClick={() => deleteRepair(r.id)} title="Xoá">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
