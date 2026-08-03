import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CampaignFormValues } from '../schemas'
import type { CampaignFilters } from '../services'
import { campaignServices } from '../services'
import { dashboardQueryKeys } from './dashboard'

export const campaignQueryKeys = {
  all: ['campaigns'] as const,
  list: (filters: CampaignFilters) => [...campaignQueryKeys.all, 'list', filters] as const,
}

export const useCampaignsQuery = (filters: CampaignFilters) =>
  useQuery({
    queryKey: campaignQueryKeys.list(filters),
    queryFn: () => campaignServices.getCampaigns(filters),
    staleTime: 60 * 1000,
  })

const invalidateCampaigns = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: campaignQueryKeys.all })
  void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all })
}

export const useCreateCampaignMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: CampaignFormValues) => campaignServices.createCampaign(values),
    onSuccess: () => invalidateCampaigns(queryClient),
  })
}

export const useUpdateCampaignMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ campaignId, values }: { campaignId: string; values: CampaignFormValues }) =>
      campaignServices.updateCampaign(campaignId, values),
    onSuccess: () => invalidateCampaigns(queryClient),
  })
}

export const useCampaignActiveMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ campaignId, isActive }: { campaignId: string; isActive: boolean }) =>
      campaignServices.setCampaignActive(campaignId, isActive),
    onSuccess: () => invalidateCampaigns(queryClient),
  })
}
