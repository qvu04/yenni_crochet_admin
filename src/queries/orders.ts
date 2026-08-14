import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orderServices, type OrderFilters, type OrderStatus } from '../services'
import { dashboardQueryKeys } from './dashboard'

export const orderQueryKeys = {
  all: ['orders'] as const,
  list: (filters: OrderFilters) => [...orderQueryKeys.all, 'list', filters] as const,
}

export const useOrdersQuery = (filters: OrderFilters) =>
  useQuery({
    queryKey: orderQueryKeys.list(filters),
    queryFn: () => orderServices.getOrders(filters),
    staleTime: 45 * 1000,
  })

export const useUpdateOrderStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      orderServices.updateOrderStatus(orderId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orderQueryKeys.all })
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all })
    },
  })
}

export const useBulkUpdateOrderStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderIds, status }: { orderIds: string[]; status: OrderStatus }) =>
      orderServices.updateManyOrderStatus(orderIds, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orderQueryKeys.all })
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all })
    },
  })
}
