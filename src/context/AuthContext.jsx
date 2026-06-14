import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        const { data } = await supabase
          .from('admin_users')
          .select('id')
          .eq('user_id', currentUser.id)
          .maybeSingle()
        setIsAdmin(!!data)
      }
      setLoading(false)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        const { data } = await supabase
          .from('admin_users')
          .select('id')
          .eq('user_id', currentUser.id)
          .maybeSingle()
        setIsAdmin(!!data)
      } else {
        setIsAdmin(false)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
