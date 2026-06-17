import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { supabase } from './lib/supabase'
import Navbar from './components/Navbar'
import AuthModal from './components/AuthModal'
import ResetPasswordModal from './components/ResetPasswordModal'
import Home from './pages/Home'
import Admin from './pages/Admin/index'
import './App.css'

function AppContent() {
  const [showAuth, setShowAuth] = useState(false)
  const [recovery, setRecovery] = useState(false)
  const { loading } = useAuth()

  // Bắt sự kiện khi người dùng bấm link đặt lại mật khẩu trong email
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Simple routing dựa vào pathname
  const isAdmin = window.location.pathname === '/admin'

  if (recovery) return <ResetPasswordModal onClose={() => setRecovery(false)} />

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
      </div>
    )
  }

  if (isAdmin) {
    return <Admin />
  }

  return (
    <div className="app">
      <Navbar onAuthClick={() => setShowAuth(true)} />
      <Home />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
