import { customRequestServices, type CustomRequest } from './custom-requests'
import { orderServices, type Order } from './orders'
import { supabase } from './supabase'
import type { Promotion, UserPromotion, UserPromotionStatus } from './vouchers'

export type CustomerFilter = 'all' | 'with_zalo' | 'without_zalo' | 'has_voucher'

export interface CustomerPromotion extends UserPromotion {
  promotions?: Promotion | Promotion[] | null
}

export interface Customer {
  id: string
  display_name: string
  phone: string | null
  address: string | null
  zalo_user_id: string | null
  order_count: number
  completed_order_count: number
  total_spent: number
  custom_request_count: number
  voucher_count: number
  used_voucher_count: number
  last_activity_at: string | null
  orders: Order[]
  custom_requests: CustomRequest[]
  user_promotions: CustomerPromotion[]
}

export interface CustomerFilters {
  search?: string
  type?: CustomerFilter
}

export interface GrantPromotionInput {
  promotionId: string
  zaloUserId: string
}

const CUSTOMER_PROMOTION_SELECT = `
  id,
  promotion_id,
  zalo_user_id,
  status,
  claimed_at,
  used_at,
  order_id,
  created_at,
  promotions(*)
`

const getOrderTotal = (order: Order) => Number(order.final_price ?? order.subtotal_price ?? 0)

const getPromotionFromRelation = (userPromotion: CustomerPromotion) =>
  Array.isArray(userPromotion.promotions) ? userPromotion.promotions[0] : userPromotion.promotions

const applyCustomerFilters = (customers: Customer[], { search, type = 'all' }: CustomerFilters) => {
  const keyword = search?.trim().toLowerCase()

  return customers.filter((customer) => {
    const matchesSearch =
      !keyword ||
      customer.display_name.toLowerCase().includes(keyword) ||
      customer.phone?.toLowerCase().includes(keyword) ||
      customer.zalo_user_id?.toLowerCase().includes(keyword)

    if (!matchesSearch) return false
    if (type === 'with_zalo') return Boolean(customer.zalo_user_id)
    if (type === 'without_zalo') return !customer.zalo_user_id
    if (type === 'has_voucher') return customer.voucher_count > 0
    return true
  })
}

const createEmptyCustomer = (id: string): Customer => ({
  id,
  display_name: 'Khách chưa rõ tên',
  phone: null,
  address: null,
  zalo_user_id: id.startsWith('zalo:') ? id.replace('zalo:', '') : null,
  order_count: 0,
  completed_order_count: 0,
  total_spent: 0,
  custom_request_count: 0,
  voucher_count: 0,
  used_voucher_count: 0,
  last_activity_at: null,
  orders: [],
  custom_requests: [],
  user_promotions: [],
})

const findCustomerKey = (customers: Map<string, Customer>, zaloUserId?: string | null, phone?: string | null) => {
  const zaloKey = zaloUserId ? `zalo:${zaloUserId}` : null
  const phoneKey = phone?.trim() ? `phone:${phone.trim()}` : null

  if (zaloKey && customers.has(zaloKey)) return zaloKey
  if (phoneKey && customers.has(phoneKey)) return phoneKey
  if (zaloUserId) {
    const existingEntry = Array.from(customers.entries()).find(([, customer]) => customer.zalo_user_id === zaloUserId)
    if (existingEntry) return existingEntry[0]
  }
  if (phone?.trim()) {
    const existingEntry = Array.from(customers.entries()).find(([, customer]) => customer.phone === phone.trim())
    if (existingEntry) return existingEntry[0]
  }
  return zaloKey ?? phoneKey
}

const upsertCustomer = (customers: Map<string, Customer>, zaloUserId?: string | null, phone?: string | null) => {
  const key = findCustomerKey(customers, zaloUserId, phone) ?? `unknown:${crypto.randomUUID()}`
  const customer = customers.get(key) ?? createEmptyCustomer(key)

  if (zaloUserId && !customer.zalo_user_id) customer.zalo_user_id = zaloUserId
  if (phone?.trim() && !customer.phone) customer.phone = phone.trim()

  customers.set(key, customer)
  return customer
}

const updateLastActivity = (customer: Customer, value: string) => {
  if (!customer.last_activity_at || new Date(value) > new Date(customer.last_activity_at)) {
    customer.last_activity_at = value
  }
}

export const customerServices = {
  getCustomers: async (filters: CustomerFilters): Promise<Customer[]> => {
    const [orders, customRequests, userPromotionsResult] = await Promise.all([
      orderServices.getOrders({}),
      customRequestServices.getCustomRequests({}),
      supabase
        .from('user_promotions')
        .select(CUSTOMER_PROMOTION_SELECT)
        .order('created_at', { ascending: false }),
    ])

    if (userPromotionsResult.error) {
      throw new Error(userPromotionsResult.error.message)
    }

    const customers = new Map<string, Customer>()
    const userPromotions = (userPromotionsResult.data ?? []) as CustomerPromotion[]

    orders.forEach((order) => {
      const customer = upsertCustomer(customers, order.zalo_user_id, order.phone)
      customer.orders.push(order)
      customer.order_count += 1
      if (order.status === 'done') customer.completed_order_count += 1
      if (order.status !== 'cancelled') customer.total_spent += getOrderTotal(order)
      customer.display_name = order.customer_name || customer.display_name
      customer.phone = order.phone || customer.phone
      customer.address = order.address || customer.address
      updateLastActivity(customer, order.created_at)
    })

    customRequests.forEach((request) => {
      const customer = upsertCustomer(customers, request.zalo_user_id, request.phone)
      customer.custom_requests.push(request)
      customer.custom_request_count += 1
      customer.display_name = request.customer_name || customer.display_name
      customer.phone = request.phone || customer.phone
      updateLastActivity(customer, request.created_at)
    })

    userPromotions.forEach((userPromotion) => {
      const customer = upsertCustomer(customers, userPromotion.zalo_user_id)
      customer.user_promotions.push(userPromotion)
      customer.voucher_count += 1
      if (userPromotion.status === 'used') customer.used_voucher_count += 1
      updateLastActivity(customer, userPromotion.created_at)
    })

    return applyCustomerFilters(
      Array.from(customers.values()).sort((firstCustomer, secondCustomer) => {
        const firstDate = firstCustomer.last_activity_at ? new Date(firstCustomer.last_activity_at).getTime() : 0
        const secondDate = secondCustomer.last_activity_at ? new Date(secondCustomer.last_activity_at).getTime() : 0
        return secondDate - firstDate
      }),
      filters,
    )
  },

  grantPromotion: async ({ promotionId, zaloUserId }: GrantPromotionInput): Promise<CustomerPromotion> => {
    const { data, error } = await supabase
      .from('user_promotions')
      .insert({
        promotion_id: promotionId,
        zalo_user_id: zaloUserId,
        status: 'claimed' satisfies UserPromotionStatus,
        claimed_at: new Date().toISOString(),
      })
      .select(CUSTOMER_PROMOTION_SELECT)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data as CustomerPromotion
  },

  getPromotionFromRelation,
}
