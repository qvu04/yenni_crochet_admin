import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { LoginFormValues } from '../schemas/auth'

export interface AdminProfile {
  id: string
  display_name: string
  role: 'admin'
  is_active: boolean
  created_at: string
  updated_at: string
}

export const authServices = {
  getSession: async (): Promise<Session | null> => {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      throw new Error(error.message)
    }

    return data.session
  },

  getAdminProfile: async (userId: string): Promise<AdminProfile | null> => {
    const { data, error } = await supabase
      .from('admin_profiles')
      .select('id, display_name, role, is_active, created_at, updated_at')
      .eq('id', userId)
      .eq('role', 'admin')
      .eq('is_active', true)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    return data as AdminProfile | null
  },

  signInAdmin: async ({ email, password }: LoginFormValues): Promise<AdminProfile> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error('Email hoặc mật khẩu chưa đúng.')
    }

    if (!data.user) {
      throw new Error('Không tìm thấy thông tin tài khoản.')
    }

    const profile = await authServices.getAdminProfile(data.user.id)

    if (!profile) {
      await supabase.auth.signOut()
      throw new Error('Tài khoản này chưa được cấp quyền admin hoặc đã bị tắt.')
    }

    return profile
  },

  signOut: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }
  },
}
