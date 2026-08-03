import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  customRequestServices,
  type CustomRequestFilters,
  type CustomRequestStatus,
} from '../services'
import { dashboardQueryKeys } from './dashboard'

export const customRequestQueryKeys = {
  all: ['custom-requests'] as const,
  list: (filters: CustomRequestFilters) => [...customRequestQueryKeys.all, 'list', filters] as const,
}

export const useCustomRequestsQuery = (filters: CustomRequestFilters) =>
  useQuery({
    queryKey: customRequestQueryKeys.list(filters),
    queryFn: () => customRequestServices.getCustomRequests(filters),
    staleTime: 45 * 1000,
  })

export const useUpdateCustomRequestStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, status }: { requestId: string; status: CustomRequestStatus }) =>
      customRequestServices.updateCustomRequestStatus(requestId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customRequestQueryKeys.all })
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all })
    },
  })
}
