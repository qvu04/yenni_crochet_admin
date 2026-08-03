import { supabase } from './supabase'

export type DashboardOrderStatus = 'pending' | 'confirmed' | 'done' | 'cancelled'
export type CustomRequestStatus = 'pending' | 'contacted' | 'completed' | 'cancelled'

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
  created_at: string
  order_items?: DashboardOrderItem[] | null
}

export interface DashboardCustomRequest {
  id: string
  customer_name: string
  phone: string
  description: string | null
  occasion: string | null
  quantity: number | null
  status: CustomRequestStatus
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

export const dashboardServices = {
  getDashboardData: async (): Promise<DashboardData> => {
    const since = new Date()
    since.setMonth(since.getMonth() - 13)
    since.setHours(0, 0, 0, 0)

    const [ordersResult, customRequestsResult, productsResult] = await Promise.all([
      supabase
        .from('orders')
        .select(DASHBOARD_ORDER_SELECT)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false })
        .limit(600),
      supabase
        .from('custom_requests')
        .select('id, customer_name, phone, description, occasion, quantity, status, created_at')
        .order('created_at', { ascending: false })
        .limit(120),
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
      orders: (ordersResult.data ?? []) as DashboardOrder[],
      customRequests: (customRequestsResult.data ?? []) as DashboardCustomRequest[],
      products: (productsResult.data ?? []) as DashboardProduct[],
    }
  },
}
