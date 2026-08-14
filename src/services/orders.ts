import { supabase } from './supabase'

export type OrderStatus =
  | 'awaiting_confirmation'
  | 'confirmed'
  | 'making'
  | 'shipping'
  | 'done'
  | 'cancelled'
export type OrderStatusFilter = 'all' | OrderStatus

export type OrderPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type OrderPaymentType = 'deposit' | 'full' | 'none'

export interface OrderItem {
  id: string
  product_id: string
  variant_id: string | null
  quantity: number
  unit_price: number
  total_price: number
  note: string | null
  variant_name: string | null
  variant_color_name: string | null
  variant_image: string | null
  products: { name: string; images: string[] | null } | { name: string; images: string[] | null }[] | null
}

export interface Order {
  id: string
  product_id: string | null
  quantity: number
  customer_name: string
  phone: string
  address: string
  note: string | null
  zalo_user_id: string | null
  status: OrderStatus
  promotion_id: string | null
  subtotal_price: number | null
  discount_amount: number | null
  final_price: number | null
  payment_type: OrderPaymentType | null
  payment_status: OrderPaymentStatus | null
  deposit_rate: number | null
  deposit_amount: number | null
  remaining_amount: number | null
  paid_at: string | null
  delivery_latitude: number | null
  delivery_longitude: number | null
  delivery_location_accuracy: number | null
  delivery_location_token: string | null
  created_at: string
  order_items?: OrderItem[] | null
}

export interface OrderFilters {
  search?: string
  status?: OrderStatusFilter
}

const ORDER_SELECT = `
  id,
  product_id,
  quantity,
  customer_name,
  phone,
  address,
  note,
  zalo_user_id,
  status,
  promotion_id,
  subtotal_price,
  discount_amount,
  final_price,
  payment_type,
  payment_status,
  deposit_rate,
  deposit_amount,
  remaining_amount,
  paid_at,
  delivery_latitude,
  delivery_longitude,
  delivery_location_accuracy,
  delivery_location_token,
  created_at,
  order_items (
    id,
    product_id,
    variant_id,
    quantity,
    unit_price,
    total_price,
    note,
    variant_name,
    variant_color_name,
    variant_image,
    products (name, images)
  )
`

const ORDER_FALLBACK_SELECT = `
  id,
  product_id,
  quantity,
  customer_name,
  phone,
  address,
  note,
  zalo_user_id,
  status,
  promotion_id,
  subtotal_price,
  discount_amount,
  final_price,
  created_at,
  order_items (
    id,
    product_id,
    variant_id,
    quantity,
    unit_price,
    total_price,
    note,
    variant_name,
    variant_color_name,
    variant_image,
    products (name, images)
  )
`

const isMissingColumnError = (error: { code?: string; message?: string } | null) =>
  error?.code === '42703' || error?.message?.toLowerCase().includes('column') === true

const withOrderDefaults = (order: Partial<Order>): Order => ({
  payment_type: null,
  payment_status: null,
  deposit_rate: null,
  deposit_amount: null,
  remaining_amount: null,
  paid_at: null,
  delivery_latitude: null,
  delivery_longitude: null,
  delivery_location_accuracy: null,
  delivery_location_token: null,
  ...order,
} as Order)

const buildOrdersQuery = (
  select: string,
  { search, status = 'all' }: OrderFilters,
) => {
  let query = supabase.from('orders').select(select).order('created_at', { ascending: false })

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  if (search?.trim()) {
    const keyword = search.trim()
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(keyword)
    query = isUuid
      ? query.or(`id.eq.${keyword},customer_name.ilike.%${keyword}%,phone.ilike.%${keyword}%`)
      : query.or(`customer_name.ilike.%${keyword}%,phone.ilike.%${keyword}%`)
  }

  return query
}

export const orderServices = {
  getOrders: async ({ search, status = 'all' }: OrderFilters): Promise<Order[]> => {
    const result = await buildOrdersQuery(ORDER_SELECT, { search, status })
    let data: unknown = result.data
    let error = result.error

    if (isMissingColumnError(error)) {
      const fallbackResult = await buildOrdersQuery(ORDER_FALLBACK_SELECT, { search, status })
      data = fallbackResult.data
      error = fallbackResult.error
    }

    if (error) {
      throw new Error(error.message)
    }

    return ((data ?? []) as Partial<Order>[]).map(withOrderDefaults)
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<Order> => {
    const result = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select(ORDER_SELECT)
      .single()
    let data: unknown = result.data
    let error = result.error

    if (isMissingColumnError(error)) {
      const fallbackResult = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select(ORDER_FALLBACK_SELECT)
        .single()

      data = fallbackResult.data
      error = fallbackResult.error
    }

    if (error) {
      throw new Error(error.message)
    }

    return withOrderDefaults(data as Partial<Order>)
  },

  updateManyOrderStatus: async (orderIds: string[], status: OrderStatus): Promise<Order[]> => {
    if (!orderIds.length) return []

    const result = await supabase
      .from('orders')
      .update({ status })
      .in('id', orderIds)
      .select(ORDER_SELECT)
    let data: unknown = result.data
    let error = result.error

    if (isMissingColumnError(error)) {
      const fallbackResult = await supabase
        .from('orders')
        .update({ status })
        .in('id', orderIds)
        .select(ORDER_FALLBACK_SELECT)

      data = fallbackResult.data
      error = fallbackResult.error
    }

    if (error) {
      throw new Error(error.message)
    }

    return ((data ?? []) as Partial<Order>[]).map(withOrderDefaults)
  },
}
