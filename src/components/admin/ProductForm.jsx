import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import './ProductForm.css'

const EMPTY = { 'Tên sản phẩm': '', 'cấu hình': '', 'Giá bán': '', 'Serial': '', 'Màu': '', 'Tình trạng pin': '', 'Ngoại hình': '', 'Ghi chú': '', status: 'con_hang', image_url: '' }

export default function ProductForm({ product, onClose, onSaved }) {
  const [form, setForm] = useState(product ? { ...product, 'Giá bán': product['Giá bán'] || '' } : { ...EMPTY })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isEdit = !!product

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(fileName, file)
    if (error) { setError('Upload ảnh thất bại: ' + error.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName)
    setForm(f => ({ ...f, image_url: publicUrl }))
    setUploading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true); setError('')
    const payload = { ...form, 'Giá bán': form['Giá bán'] ? Number(form['Giá bán']) : null }
    if (isEdit) {
      const { error } = await supabase.from('products').update(payload).eq('id', product.id)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('products').insert([payload])
      if (error) { setError(error.message); setSaving(false); return }
    }
    setSaving(false)
    onSaved()
  }

  return (
    <div className="form-overlay" onClick={onClose}>
      <div className="form-modal" onClick={e => e.stopPropagation()}>
        <div className="form-header">
          <h2>{isEdit ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm'}</h2>
          <button className="form-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="form-body">
          {/* Ảnh */}
          <div className="form-section">
            <label className="form-label">Ảnh sản phẩm</label>
            <div className="image-upload-area">
              {form.image_url && <img src={form.image_url} alt="" className="preview-img" />}
              <div className="upload-controls">
                <label className="btn-upload">
                  {uploading ? 'Đang upload...' : '📁 Chọn ảnh'}
                  <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
                </label>
                <span className="upload-or">hoặc</span>
                <input className="form-input" placeholder="Dán link ảnh URL" name="image_url" value={form.image_url} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group full">
              <label className="form-label">Tên sản phẩm *</label>
              <input className="form-input" name="Tên sản phẩm" value={form['Tên sản phẩm']} onChange={handleChange} required placeholder="Surface Pro 9 i5/8/256" />
            </div>
            <div className="form-group full">
              <label className="form-label">Cấu hình</label>
              <input className="form-input" name="cấu hình" value={form['cấu hình']} onChange={handleChange} placeholder="Intel Core i5, RAM 8GB, SSD 256GB" />
            </div>
            <div className="form-group">
              <label className="form-label">Giá bán (₫)</label>
              <input className="form-input" name="Giá bán" type="number" value={form['Giá bán']} onChange={handleChange} placeholder="18500000" />
            </div>
            <div className="form-group">
              <label className="form-label">Trạng thái</label>
              <select className="form-input" name="status" value={form.status} onChange={handleChange}>
                <option value="con_hang">Còn hàng</option>
                <option value="da_ban">Đã bán</option>
                <option value="dang_ve">Đang về</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Serial</label>
              <input className="form-input" name="Serial" value={form['Serial']} onChange={handleChange} placeholder="SN123456" />
            </div>
            <div className="form-group">
              <label className="form-label">Màu</label>
              <input className="form-input" name="Màu" value={form['Màu']} onChange={handleChange} placeholder="Platinum, Black..." />
            </div>
            <div className="form-group">
              <label className="form-label">Tình trạng pin</label>
              <input className="form-input" name="Tình trạng pin" value={form['Tình trạng pin']} onChange={handleChange} placeholder="99%, Like New..." />
            </div>
            <div className="form-group">
              <label className="form-label">Ngoại hình</label>
              <input className="form-input" name="Ngoại hình" value={form['Ngoại hình']} onChange={handleChange} placeholder="Like New 99%, 98%..." />
            </div>
            <div className="form-group full">
              <label className="form-label">Ghi chú</label>
              <textarea className="form-input" name="Ghi chú" value={form['Ghi chú']} onChange={handleChange} rows={3} placeholder="Thông tin thêm..." />
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Đang lưu...' : isEdit ? '💾 Lưu thay đổi' : '➕ Thêm sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
