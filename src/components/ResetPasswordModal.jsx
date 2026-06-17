import { useState } from 'react'
import { supabase } from '../lib/supabase'
import './AuthModal.css'

export default function ResetPasswordModal({ onClose }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Mật khẩu tối thiểu 6 ký tự'); return }
    if (password !== confirm) { setError('Mật khẩu nhập lại không khớp'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError('Không đổi được mật khẩu: ' + error.message); return }
    setDone(true)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-logo"><span>🔑</span><span>Đặt lại mật khẩu</span></div>
        {done ? (
          <div style={{ textAlign: 'center' }}>
            <p className="form-success">✅ Đã đổi mật khẩu thành công!</p>
            <button className="btn-submit" onClick={() => { onClose(); window.location.href = '/' }}>Đăng nhập lại</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Mật khẩu mới</label><input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} /></div>
            <div className="form-group"><label>Nhập lại mật khẩu</label><input type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={6} /></div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn-submit" disabled={loading}>{loading ? 'Đang lưu...' : 'Đổi mật khẩu'}</button>
          </form>
        )}
      </div>
    </div>
  )
}
