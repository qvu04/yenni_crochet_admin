import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import { useAdminProfileQuery } from '../queries/auth'
import { AuthContext, type AuthContextValue } from './auth-context'

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<Session | null>(null)
  const [isSessionLoading, setIsSessionLoading] = useState(true)
  const adminProfileQuery = useAdminProfileQuery(session?.user.id)

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return
      setSession(data.session)
      setIsSessionLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)

      if (!nextSession) {
        queryClient.removeQueries({ queryKey: ['auth'] })
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      adminProfile: adminProfileQuery.data ?? null,
      isLoading: isSessionLoading || adminProfileQuery.isLoading,
      isAdmin: Boolean(adminProfileQuery.data),
    }),
    [adminProfileQuery.data, adminProfileQuery.isLoading, isSessionLoading, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
