/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { DEFAULT_PERMISSIONS, OWNER_PERMISSIONS } from '../lib/permissions'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isOwner, setIsOwner] = useState(false)
  const [staffProfile, setStaffProfile] = useState(null)
  const [perms, setPerms] = useState({})
  const [loading, setLoading] = useState(true)

  async function resolveAccess(currentUser) {
    if (!currentUser) {
      setIsOwner(false); setStaffProfile(null); setPerms({})
      return
    }
    // Chủ cửa hàng?
    const { data: adminRow } = await supabase
      .from('admin_users').select('id').eq('user_id', currentUser.id).maybeSingle()
    if (adminRow) {
      setIsOwner(true); setStaffProfile(null); setPerms(OWNER_PERMISSIONS)
      return
    }
    // Nhân viên có tài khoản liên kết?
    const { data: staffRow } = await supabase
      .from('staff').select('*').eq('user_id', currentUser.id).maybeSingle()
    if (staffRow) {
      setIsOwner(false)
      setStaffProfile(staffRow)
      setPerms(staffRow.permissions || DEFAULT_PERMISSIONS)
      return
    }
    setIsOwner(false); setStaffProfile(null); setPerms({})
  }

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)
      await resolveAccess(currentUser)
      setLoading(false)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      await resolveAccess(currentUser)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const canAccessAdmin = isOwner || !!staffProfile

  return (
    <AuthContext.Provider value={{ user, isOwner, staffProfile, perms, canAccessAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
