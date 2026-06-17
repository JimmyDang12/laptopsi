import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { DEFAULT_PERMISSIONS } from '../../lib/permissions'
import PermissionModal from './PermissionModal'
import './StaffPanel.css'

// Client phụ để đăng ký tài khoản nhân viên mà KHÔNG ảnh hưởng phiên đăng nhập của admin
const signupClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false, storageKey: 'sb-staff-signup' } }
)

export default function StaffPanel({ staff = [], onChanged }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' })
  const [saving, setSaving] = useState(false)
  const [permStaff, setPermStaff] = useState(null)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  async function addStaff(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      alert('⚠️ Vui lòng nhập tên nhân viên')
      return
    }
    const wantAccount = form.email.trim() || form.password
    if (wantAccount && (!form.email.trim() || form.password.length < 6)) {
      alert('⚠️ Để tạo tài khoản đăng nhập, cần nhập email và mật khẩu tối thiểu 6 ký tự')
      return
    }

    setSaving(true)
    try {
      let userId = null

      // 1. Tạo tài khoản đăng nhập (nếu có email + mật khẩu)
      if (wantAccount) {
        const { data: signUp, error: signErr } = await signupClient.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: { data: { full_name: form.name.trim(), phone: form.phone.trim() } }
        })
        if (signErr) throw signErr
        userId = signUp?.user?.id || null
      }

      // Lưu bản ghi nhân viên (liên kết tài khoản qua user_id + email, kèm quyền mặc định)
      const { data, error } = await supabase.from('staff').insert([{
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        user_id: userId,
        permissions: DEFAULT_PERMISSIONS,
        created_at: new Date().toISOString()
      }]).select()
      if (error) throw error

      setForm({ name: '', phone: '', email: '', password: '' })
      if (onChanged) onChanged()
      alert(wantAccount
        ? `✅ Đã thêm nhân viên "${data?.[0]?.name}" kèm tài khoản đăng nhập (${form.email.trim()})`
        : `✅ Đã thêm nhân viên "${data?.[0]?.name}"`)
    } catch (err) {
      console.error('Lỗi thêm nhân viên:', err)
      alert('❌ ' + (err.message || 'Không thể thêm nhân viên'))
    } finally {
      setSaving(false)
    }
  }

  async function editStaff(s) {
    const name = prompt('Tên nhân viên:', s.name)
    if (name === null) return
    const phone = prompt('Số điện thoại:', s.phone || '')
    if (phone === null) return
    const { error } = await supabase.from('staff').update({ name: name.trim(), phone: phone.trim() || null }).eq('id', s.id)
    if (error) { alert('❌ ' + error.message); return }
    if (onChanged) onChanged()
  }

  async function sendResetLink(s) {
    if (!s.email) { alert('⚠️ Nhân viên này chưa có email/tài khoản.'); return }
    if (!confirm(`Gửi link đặt lại mật khẩu tới ${s.email}?`)) return
    const { error } = await supabase.auth.resetPasswordForEmail(s.email, { redirectTo: window.location.origin })
    if (error) { alert('❌ ' + error.message); return }
    alert(`✅ Đã gửi link đặt lại mật khẩu tới ${s.email}. Nhân viên mở email để đổi mật khẩu.`)
  }

  async function deleteStaff(s) {
    if (!confirm(`Xoá nhân viên "${s.name}"?\n(Tài khoản sẽ bị thu hồi quyền truy cập, các đơn đã gán sẽ được gỡ liên kết)`)) return
    // Thu hồi quyền admin của tài khoản này
    if (s.user_id) await supabase.from('admin_users').delete().eq('user_id', s.user_id)
    // Gỡ liên kết khỏi đơn hàng
    await supabase.from('orders').update({ staff_id: null }).eq('staff_id', s.id)
    const { error } = await supabase.from('staff').delete().eq('id', s.id)
    if (error) { alert('❌ ' + error.message); return }
    if (onChanged) onChanged()
  }

  return (
    <div className="staff-panel">
      <form className="staff-add" onSubmit={addStaff}>
        <div className="staff-add-row">
          <input name="name" placeholder="Tên nhân viên *" value={form.name} onChange={handleChange} />
          <input name="phone" placeholder="Số điện thoại" value={form.phone} onChange={handleChange} />
        </div>
        <div className="staff-add-row">
          <input name="email" type="email" placeholder="Email đăng nhập" value={form.email} onChange={handleChange} />
          <input name="password" type="password" placeholder="Mật khẩu (≥6 ký tự)" value={form.password} onChange={handleChange} />
        </div>
        <div className="staff-add-foot">
          <small className="staff-hint">💡 Nhập email + mật khẩu để tạo tài khoản đăng nhập cho nhân viên (vào được trang quản lý). Bỏ trống nếu chỉ cần tên để gán đơn.</small>
          <button type="submit" className="btn-add" disabled={saving}>
            {saving ? 'Đang thêm...' : '+ Thêm nhân viên'}
          </button>
        </div>
      </form>

      {staff.length === 0 ? (
        <div className="table-empty">Chưa có nhân viên nào.</div>
      ) : (
        <div className="table-wrap">
          <table className="staff-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên nhân viên</th>
                <th>Số điện thoại</th>
                <th>Tài khoản</th>
                <th style={{ width: '300px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s, i) => (
                <tr key={s.id}>
                  <td>#{i + 1}</td>
                  <td className="staff-name">{s.name}</td>
                  <td>{s.phone ? <a href={`tel:${s.phone}`}>{s.phone}</a> : '—'}</td>
                  <td>{s.user_id ? <span className="staff-acc yes">🔑 {s.email || 'Có tài khoản'}</span> : <span className="staff-acc no">—</span>}</td>
                  <td>
                    <div className="staff-actions">
                      <button className="btn-perm" onClick={() => setPermStaff(s)}>🔐 Quyền</button>
                      {s.email && <button className="btn-reset" onClick={() => sendResetLink(s)}>✉️ Đặt lại MK</button>}
                      <button className="btn-edit" onClick={() => editStaff(s)}>✏️ Sửa</button>
                      <button className="btn-delete" onClick={() => deleteStaff(s)}>🗑️ Xoá</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {permStaff && (
        <PermissionModal staff={permStaff} onClose={() => setPermStaff(null)} onSaved={onChanged} />
      )}
    </div>
  )
}
