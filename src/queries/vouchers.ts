import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { PromotionFormValues } from '../schemas'
import type { PromotionFilters } from '../services'
import { voucherServices } from '../services'
import { dashboardQueryKeys } from './dashboard'

export const voucherQueryKeys = {
  all: ['vouchers'] as const,
  list: (filters: PromotionFilters) => [...voucherQueryKeys.all, 'list', filters] as const,
}

export const usePromotionsQuery = (filters: PromotionFilters) =>
  useQuery({
    queryKey: voucherQueryKeys.list(filters),
    queryFn: () => voucherServices.getPromotions(filters),
    staleTime: 60 * 1000,
  })

const invalidateVouchers = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: voucherQueryKeys.all })
  void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all })
}

export const useCreatePromotionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: PromotionFormValues) => voucherServices.createPromotion(values),
    onSuccess: () => invalidateVouchers(queryClient),
  })
}

export const useUpdatePromotionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ promotionId, values }: { promotionId: string; values: PromotionFormValues }) =>
      voucherServices.updatePromotion(promotionId, values),
    onSuccess: () => invalidateVouchers(queryClient),
  })
}

export const usePromotionActiveMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ promotionId, isActive }: { promotionId: string; isActive: boolean }) =>
      voucherServices.setPromotionActive(promotionId, isActive),
    onSuccess: () => invalidateVouchers(queryClient),
  })
}

export const useUploadPromotionBannerMutation = () =>
  useMutation({
    mutationFn: (file: File) => voucherServices.uploadPromotionBanner(file),
  })
