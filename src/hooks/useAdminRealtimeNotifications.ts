import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js'
import { customRequestQueryKeys, dashboardQueryKeys, orderQueryKeys } from '../queries'
import type { CustomRequest, Order } from '../services'
import { supabase } from '../services'

export type AdminNotificationType = 'order' | 'custom_request'

export interface AdminNotification {
  id: string
  type: AdminNotificationType
  title: string
  description: string
  createdAt: string
  href: string
}

const MAX_NOTIFICATIONS = 8

const createOrderNotification = (
  payload: RealtimePostgresInsertPayload<Partial<Order>>,
): AdminNotification => {
  const order = payload.new

  return {
    id: `order:${order.id ?? crypto.randomUUID()}`,
    type: 'order',
    title: 'Có đơn hàng mới',
    description: `${order.customer_name ?? 'Khách hàng'}${order.phone ? ` - ${order.phone}` : ''}`,
    createdAt: order.created_at ?? new Date().toISOString(),
    href: '/orders',
  }
}

const createCustomRequestNotification = (
  payload: RealtimePostgresInsertPayload<Partial<CustomRequest>>,
): AdminNotification => {
  const request = payload.new

  return {
    id: `custom-request:${request.id ?? crypto.randomUUID()}`,
    type: 'custom_request',
    title: 'Có yêu cầu đặt riêng mới',
    description: `${request.customer_name ?? 'Khách hàng'}${request.phone ? ` - ${request.phone}` : ''}`,
    createdAt: request.created_at ?? new Date().toISOString(),
    href: '/custom-requests',
  }
}

export const useAdminRealtimeNotifications = (enabled: boolean) => {
  const queryClient = useQueryClient()
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connected' | 'error'>('idle')

  useEffect(() => {
    if (!enabled) {
      setConnectionStatus('idle')
      return undefined
    }

    const addNotification = (notification: AdminNotification) => {
      setNotifications((currentNotifications) => {
        if (currentNotifications.some((item) => item.id === notification.id)) {
          return currentNotifications
        }

        return [notification, ...currentNotifications].slice(0, MAX_NOTIFICATIONS)
      })
      setUnreadCount((currentCount) => currentCount + 1)
    }

    const channel = supabase
      .channel('admin-realtime-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload: RealtimePostgresInsertPayload<Partial<Order>>) => {
          addNotification(createOrderNotification(payload))
          void queryClient.invalidateQueries({ queryKey: orderQueryKeys.all })
          void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all })
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'custom_requests' },
        (payload: RealtimePostgresInsertPayload<Partial<CustomRequest>>) => {
          addNotification(createCustomRequestNotification(payload))
          void queryClient.invalidateQueries({ queryKey: customRequestQueryKeys.all })
          void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all })
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected')
          return
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setConnectionStatus('error')
        }
      })

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [enabled, queryClient])

  return useMemo(
    () => ({
      notifications,
      unreadCount,
      connectionStatus,
      markAllAsRead: () => setUnreadCount(0),
      clearNotifications: () => {
        setNotifications([])
        setUnreadCount(0)
      },
    }),
    [connectionStatus, notifications, unreadCount],
  )
}
