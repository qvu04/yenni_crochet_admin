import { supabase } from './supabase'

export type DashboardOrderStatus =
  | 'awaiting_confirmation'
  | 'confirmed'
  | 'making'
  | 'shipping'
  | 'done'
  | 'cancelled'
export type DashboardCustomRequestStatus = 'pending' | 'contacted' | 'completed' | 'cancelled'

export interface DashboardOrderItem {
  id: string
  quantity: number
  unit_price: number
  total_price: number
  variant_name: string | null
  variant_color_name: string | null
  products: { name: string } | { name: string }[] | null
}

export interface DashboardOrder {
  id: string
  customer_name: string
  phone: string
  status: DashboardOrderStatus
  quantity: number
  subtotal_price: number | null
  discount_amount: number | null
  final_price: number | null
  shipping_fee: number | null
  payment_type: 'deposit' | 'full' | 'none' | null
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | null
  deposit_amount: number | null
  remaining_amount: number | null
  created_at: string
  order_items?: DashboardOrderItem[] | null
}

export interface DashboardCustomRequest {
  id: string
  customer_name: string
  phone: string
  description: string | null
  occasion: string | null
  expected_date: string | null
  budget_range: string | null
  quantity: number | null
  status: DashboardCustomRequestStatus
  created_at: string
}

export interface DashboardProductVariant {
  id: string
  name: string
  color_name: string | null
  stock_quantity: number
  is_active: boolean
}

export interface DashboardProduct {
  id: string
  name: string
  stock_quantity: number
  is_active: boolean
  is_pre_order: boolean
  product_type: string | null
  product_variants?: DashboardProductVariant[] | null
}

export interface DashboardData {
  orders: DashboardOrder[]
  customRequests: DashboardCustomRequest[]
  products: DashboardProduct[]
}

const DASHBOARD_ORDER_SELECT = `
  id,
  customer_name,
  phone,
  status,
  quantity,
  subtotal_price,
  discount_amount,
  final_price,
  shipping_fee,
  payment_type,
  payment_status,
  deposit_amount,
  remaining_amount,
  created_at,
  order_items (
    id,
    quantity,
    unit_price,
    total_price,
    variant_name,
    variant_color_name,
    products (name)
  )
`

const DASHBOARD_ORDER_FALLBACK_SELECT = `
  id,
  customer_name,
  phone,
  status,
  quantity,
  subtotal_price,
  discount_amount,
  final_price,
  created_at,
  order_items (
    id,
    quantity,
    unit_price,
    total_price,
    variant_name,
    variant_color_name,
    products (name)
  )
`

const DASHBOARD_CUSTOM_REQUEST_SELECT = `
  id,
  customer_name,
  phone,
  description,
  occasion,
  expected_date,
  budget_range,
  quantity,
  status,
  created_at
`

const DASHBOARD_CUSTOM_REQUEST_FALLBACK_SELECT = `
  id,
  customer_name,
  phone,
  description,
  occasion,
  quantity,
  status,
  created_at
`

const isMissingColumnError = (error: { code?: string; message?: string } | null) =>
  error?.code === '42703' || error?.message?.toLowerCase().includes('column') === true

const withDashboardCustomRequestDefaults = (
  request: Partial<DashboardCustomRequest>,
): DashboardCustomRequest => ({
  expected_date: null,
  budget_range: null,
  ...request,
} as DashboardCustomRequest)

const withDashboardOrderDefaults = (order: Partial<DashboardOrder>): DashboardOrder => ({
  payment_type: null,
  payment_status: null,
  shipping_fee: 0,
  deposit_amount: null,
  remaining_amount: null,
  ...order,
} as DashboardOrder)

const getDashboardOrders = async (since: Date) => {
  const result = await supabase
    .from('orders')
    .select(DASHBOARD_ORDER_SELECT)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })
    .limit(600)
  let data: unknown = result.data
  let error = result.error

  if (isMissingColumnError(error)) {
    const fallbackResult = await supabase
      .from('orders')
      .select(DASHBOARD_ORDER_FALLBACK_SELECT)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .limit(600)

    data = fallbackResult.data
    error = fallbackResult.error
  }

  return {
    data: ((data ?? []) as Partial<DashboardOrder>[]).map(withDashboardOrderDefaults),
    error,
  }
}

const getDashboardCustomRequests = async () => {
  const result = await supabase
    .from('custom_requests')
    .select(DASHBOARD_CUSTOM_REQUEST_SELECT)
    .order('created_at', { ascending: false })
    .limit(120)
  let data: unknown = result.data
  let error = result.error

  if (isMissingColumnError(error)) {
    const fallbackResult = await supabase
      .from('custom_requests')
      .select(DASHBOARD_CUSTOM_REQUEST_FALLBACK_SELECT)
      .order('created_at', { ascending: false })
      .limit(120)

    data = fallbackResult.data
    error = fallbackResult.error
  }

  return {
    data: ((data ?? []) as Partial<DashboardCustomRequest>[]).map(withDashboardCustomRequestDefaults),
    error,
  }
}

export const dashboardServices = {
  getDashboardData: async (): Promise<DashboardData> => {
    const since = new Date()
    since.setMonth(since.getMonth() - 13)
    since.setHours(0, 0, 0, 0)

    const [ordersResult, customRequestsResult, productsResult] = await Promise.all([
      getDashboardOrders(since),
      getDashboardCustomRequests(),
      supabase
        .from('products')
        .select('id, name, stock_quantity, is_active, is_pre_order, product_type, product_variants(id, name, color_name, stock_quantity, is_active)')
        .order('created_at', { ascending: false }),
    ])

    if (ordersResult.error) {
      throw new Error(ordersResult.error.message)
    }

    if (customRequestsResult.error) {
      throw new Error(customRequestsResult.error.message)
    }

    if (productsResult.error) {
      throw new Error(productsResult.error.message)
    }

    return {
      orders: ordersResult.data,
      customRequests: customRequestsResult.data,
      products: (productsResult.data ?? []) as DashboardProduct[],
    }
  },
}
