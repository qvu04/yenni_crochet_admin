import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { accountPreferenceServices } from '../services/account-preferences'
import { authServices } from '../services/auth'
import type { LoginFormValues } from '../schemas/auth'

export const authQueryKeys = {
  all: ['auth'] as const,
  adminProfile: (userId: string | undefined) => [...authQueryKeys.all, 'admin-profile', userId] as const,
}

export const useAdminProfileQuery = (userId: string | undefined) =>
  useQuery({
    queryKey: authQueryKeys.adminProfile(userId),
    queryFn: () => authServices.getAdminProfile(userId!),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  })

export const useLoginMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: LoginFormValues) => authServices.signInAdmin(values),
    onSuccess: (profile, values) => {
      queryClient.setQueryData(authQueryKeys.adminProfile(profile.id), profile)

      if (values.rememberEmail) {
        accountPreferenceServices.saveRememberedAdminEmail(values.email)
      } else {
        accountPreferenceServices.clearRememberedAdminEmail()
      }
    },
  })
}

export const useLogoutMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authServices.signOut,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authQueryKeys.all })
    },
  })
}
