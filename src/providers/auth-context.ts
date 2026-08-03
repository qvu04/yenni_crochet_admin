import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { AdminProfile } from '../services/auth'

export interface AuthContextValue {
  session: Session | null
  adminProfile: AdminProfile | null
  isLoading: boolean
  isAdmin: boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
