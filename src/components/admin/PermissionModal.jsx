import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { PERMISSION_DEFS, DEFAULT_PERMISSIONS } from '../../lib/permissions'
import './PermissionModal.css'

export default function PermissionModal({ staff, onClose, onSaved }) {
  const [perms, setPerms] = useState({ ...DEFAULT_PERMISSIONS, ...(staff.permissions || {}) })
  const [saving, setSaving] = useState(false)

  function toggle(key) {
    setPerms(p => ({ ...p, [key]: !p[key] }))
  }

  async function save() {
    setSaving(true)
    try {
      const { error } = await supabase.from('staff').update({ permissions: perms }).eq('id', staff.id)
      if (error) throw error
      if (onSaved) onSaved()
      onClose()
    } catch (err) {
      console.error('Lỗi lưu quyền:', err)
      alert('❌ ' + (err.message || 'Không thể lưu quyền'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box perm-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>🔐 Phân quyền</h2>
        <p className="perm-staff">{staff.name}{staff.email ? ` · ${staff.email}` : ''}</p>
        {!staff.user_id && (
          <p className="perm-warn">⚠️ Nhân viên này chưa có tài khoản đăng nhập nên quyền chưa có tác dụng.</p>
        )}

        <div className="perm-list">
          {PERMISSION_DEFS.map(def => (
            <label key={def.key} className="perm-item">
              <input type="checkbox" checked={!!perms[def.key]} onChange={() => toggle(def.key)} />
              <span className="perm-text">
                <span className="perm-label">{def.label}</span>
                <span className="perm-desc">{def.desc}</span>
              </span>
            </label>
          ))}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>Huỷ</button>
          <button type="button" className="btn-submit" onClick={save} disabled={saving}>
            {saving ? 'Đang lưu...' : '💾 Lưu quyền'}
          </button>
        </div>
      </div>
    </div>
  )
}
