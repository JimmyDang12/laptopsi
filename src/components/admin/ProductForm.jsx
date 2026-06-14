import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import './ProductForm.css'

const EMPTY = { 'Tên sản phẩm': '', 'cấu hình': '', 'Giá bán': '', 'Serial': '', 'Màu': '', 'Tình trạng pin': '', 'Ngoại hình': '', 'Ghi chú': '', status: 'con_hang', image_url: '' }

export default function ProductForm({ product, onClose, onSaved }) {
  const [form, setForm] = useState(product ? { ...product, 'Giá bán': product['Giá bán'] || '' } : { ...EMPTY })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [extraImages, setExtraImages] = useState([])

  const isEdit = !!product

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    const urls = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('product-images').upload(fileName, file)
      if (error) { setError('Upload thất bại: ' + error.message); continue }
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName)
      urls.push(publicUrl)
    }
    if (urls.length > 0) {
      if (!form.image_url) {
        setForm(f => ({ ...f, image_url: urls[0] }))
        setExtraImages(prev => [...prev, ...urls.slice(1)])
      } else {
        setExtraImages(prev => [...prev, ...urls])
      }
    }
    setUploading(false)
  }

  function removeExtraImage(url) {
    setExtraImages(prev => prev.filter(u => u !== url))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true); setError('')
    const payload = { ...form, 'Giá bán': form['Giá bán'] ? Number(form['Giá bán']) : null }
    let productId = product?.id

    if (isEdit) {
      const { error } = await supabase.from('products').update(payload).eq('id', product.id)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { data, error } = await supabase.from('products').insert([payload]).select().single()
      if (error) { setError(error.message); setSaving(false); return }
      productId = data.id
    }

    // Lưu ảnh phụ vào product_images
    if (extraImages.length > 0) {
      const imageRows = extraImages.map((url, i) => ({ product_id: productId, image_url: url, order: i + 1 }))
      await supabase.from('product_images').insert(imageRows)
    }

    setSaving(false)
    onSaved()
  }

  const allPreviews = [form.image_url, ...extraImages].filter(Boolean)

  return (
    <div className="form-overlay" onClick={onClose}>
      <div className="form-modal" onClick={e => e.stopPropagation()}>
        <div className="form-header">
          <h2>{isEdit ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm'}</h2>
          <button className="form-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="form-body">
          <div className="form-section">
            <label className="form-label">Ảnh sản phẩm (chọn nhiều ảnh cùng lúc)</label>
            <label className="btn-upload">
              {uploading ? '⏳ Đang upload...' : '📁 Chọn ảnh (có thể chọn nhiều)'}
              <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
            </label>
            {allPreviews.length > 0 && (
              <div className="preview-list">
                {allPreviews.map((url, i) => (
                  <div key={url} className="preview-item">
                    <img src={url} alt="" />
                    {i === 0 && <span className="preview-main">Ảnh chính</span>}
                    {i > 0 && <button type="button" className="preview-remove" onClick={() => removeExtraImage(url)}>✕</button>}
                  </div>
                ))}
              </div>
            )}
            <div className="upload-or">hoặc dán link URL</div>
            <input className="form-input" placeholder="https://..." name="image_url" value={form.image_url} onChange={handleChange} />
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
              <input className="form-input" name="Ngoại hình" value={form['Ngoại hình']} onChange={handleChange} placeholder="Like New 99%..." />
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
