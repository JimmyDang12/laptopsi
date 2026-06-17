import { useState } from 'react'
import { supabase } from '../lib/supabase'
import './AuthModal.css'

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '', address: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [canResend, setCanResend] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  const switchMode = m => { setMode(m); setError(''); setSuccess(''); setCanResend(false) }

  async function resendConfirm() {
    if (!form.email) { setError('Nhập email trước đã'); return }
    setLoading(true); setError(''); setSuccess('')
    const { error } = await supabase.auth.resend({ type: 'signup', email: form.email })
    if (error) setError('Không gửi lại được: ' + error.message)
    else setSuccess('Đã gửi lại email xác nhận. Kiểm tra hộp thư (cả mục Spam).')
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true); setError(''); setSuccess(''); setCanResend(false)

    if (mode === 'forgot') {
      if (!form.email) { setError('Vui lòng nhập email'); setLoading(false); return }
      const { error } = await supabase.auth.resetPasswordForEmail(form.email, { redirectTo: window.location.origin })
      if (error) setError('Không gửi được: ' + error.message)
      else setSuccess('Đã gửi link đặt lại mật khẩu tới email. Kiểm tra hộp thư (cả mục Spam).')
      setLoading(false)
      return
    }

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
      if (error) {
        setError('Sai email/mật khẩu, HOẶC tài khoản chưa xác thực email. Nếu chắc chắn đúng mật khẩu, hãy mở email bấm link xác nhận (hoặc gửi lại bên dưới).')
        setCanResend(true)
      } else onClose()
      setLoading(false)
      return
    }

    // Đăng ký
    if (!form.name || !form.phone) {
      setError('Vui lòng nhập họ tên và số điện thoại')
      setLoading(false)
      return
    }

    const { data: signUpData, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name, phone: form.phone, address: form.address } }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Tự tạo hồ sơ khách hàng từ thông tin đăng ký (nếu chưa có)
    try {
      const now = new Date().toISOString()
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', form.phone)
        .maybeSingle()

      if (!existing) {
        await supabase.from('customers').insert([{
          name: form.name,
          phone: form.phone,
          email: form.email || null,
          address: form.address || null,
          created_by: signUpData?.user?.id || null,
          created_at: now,
          updated_at: now
        }])
      }
    } catch (err) {
      console.error('Không thể tạo hồ sơ khách hàng:', err)
    }

    setSuccess('Đăng ký thành công! Kiểm tra email để xác nhận, sau đó đăng nhập.')
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-logo"><span>💻</span><span>Smartlaptop Store</span></div>
        {mode !== 'forgot' && (
          <div className="modal-tabs">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>Đăng nhập</button>
            <button className={mode === 'register' ? 'active' : ''} onClick={() => switchMode('register')}>Đăng ký</button>
          </div>
        )}
        {mode === 'forgot' && <h3 className="forgot-title">🔑 Quên mật khẩu</h3>}
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div className="form-group"><label>Họ và tên *</label><input name="name" placeholder="Nguyễn Văn A" value={form.name} onChange={handleChange} required /></div>
              <div className="form-group"><label>Số điện thoại *</label><input name="phone" type="tel" placeholder="0912345678" value={form.phone} onChange={handleChange} required /></div>
              <div className="form-group"><label>Địa chỉ</label><input name="address" placeholder="123 Đường ABC, Quận 1, TP HCM" value={form.address} onChange={handleChange} /></div>
            </>
          )}
          <div className="form-group"><label>Email</label><input name="email" type="email" placeholder="email@example.com" value={form.email} onChange={handleChange} required /></div>
          {mode !== 'forgot' && (
            <div className="form-group"><label>Mật khẩu</label><input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required minLength={6} /></div>
          )}
          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Đăng ký' : 'Gửi link đặt lại mật khẩu'}
          </button>
          {mode === 'login' && canResend && (
            <button type="button" className="btn-resend" onClick={resendConfirm} disabled={loading}>
              ✉️ Gửi lại email xác nhận
            </button>
          )}
          {mode === 'login' && (
            <p className="forgot-link" onClick={() => switchMode('forgot')}>Quên mật khẩu?</p>
          )}
          {mode === 'forgot' && (
            <p className="forgot-link" onClick={() => switchMode('login')}>← Quay lại đăng nhập</p>
          )}
        </form>
      </div>
    </div>
  )
}
