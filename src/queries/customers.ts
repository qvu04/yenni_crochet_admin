import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CustomerFilters, GrantPromotionInput } from '../services'
import { customerServices } from '../services'
import { dashboardQueryKeys } from './dashboard'
import { voucherQueryKeys } from './vouchers'

export const customerQueryKeys = {
  all: ['customers'] as const,
  list: (filters: CustomerFilters) => [...customerQueryKeys.all, 'list', filters] as const,
}

export const useCustomersQuery = (filters: CustomerFilters) =>
  useQuery({
    queryKey: customerQueryKeys.list(filters),
    queryFn: () => customerServices.getCustomers(filters),
    staleTime: 60 * 1000,
  })

export const useGrantPromotionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: GrantPromotionInput) => customerServices.grantPromotion(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerQueryKeys.all })
      void queryClient.invalidateQueries({ queryKey: voucherQueryKeys.all })
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all })
    },
  })
}
