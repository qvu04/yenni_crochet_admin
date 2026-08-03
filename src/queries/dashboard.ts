import { useQuery } from '@tanstack/react-query'
import { dashboardServices } from '../services/dashboard'

export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardQueryKeys.all, 'summary'] as const,
}

export const useDashboardQuery = () =>
  useQuery({
    queryKey: dashboardQueryKeys.summary(),
    queryFn: dashboardServices.getDashboardData,
    staleTime: 60 * 1000,
  })
