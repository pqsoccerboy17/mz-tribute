import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'

export interface AdminContextValue {
  isAdmin: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  showHidden: boolean
  toggleShowHidden: () => void
}

export const AdminContext = createContext<AdminContextValue>({
  isAdmin: false,
  loading: true,
  login: async () => {},
  logout: () => {},
  showHidden: false,
  toggleShowHidden: () => {},
})

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showHidden, setShowHidden] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(!!session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const logout = useCallback(() => {
    supabase.auth.signOut()
    setShowHidden(false)
  }, [])

  const toggleShowHidden = useCallback(() => {
    setShowHidden((prev) => !prev)
  }, [])

  return (
    <AdminContext.Provider
      value={{ isAdmin, loading, login, logout, showHidden, toggleShowHidden }}
    >
      {children}
    </AdminContext.Provider>
  )
}
