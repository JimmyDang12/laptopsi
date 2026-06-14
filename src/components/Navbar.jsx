import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar({ onAuthClick }) {
  const { user, isAdmin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  async function handleLogout() { await supabase.auth.signOut(); setMenuOpen(false) }
  return (
    <nav className="navbar">
      <div className="nav-brand"><span className="nav-icon">💻</span><span>Smartlaptop Store</span></div>
      <div className="nav-right">
        {user ? (
          <div className="nav-user">
            <button className="nav-avatar" onClick={() => setMenuOpen(!menuOpen)}>
              {user.email[0].toUpperCase()}
            </button>
            {menuOpen && (
              <div className="nav-dropdown">
                <p className="nav-email">{user.email}</p>
                {isAdmin && <a href="/admin.html" className="dropdown-item">⚙️ Quản trị</a>}
                <button className="dropdown-item logout" onClick={handleLogout}>Đăng xuất</button>
              </div>
            )}
          </div>
        ) : (
          <button className="btn-login" onClick={onAuthClick}>Đăng nhập</button>
        )}
      </div>
    </nav>
  )
}
