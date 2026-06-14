import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import AuthModal from './components/AuthModal'
import Home from './pages/Home'
import './App.css'

function AppContent() {
  const [showAuth, setShowAuth] = useState(false)
  const { loading } = useAuth()
  if (loading) return <div className="app-loading"><div className="spinner"></div></div>
  return (
    <div className="app">
      <Navbar onAuthClick={() => setShowAuth(true)} />
      <Home />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>
}
