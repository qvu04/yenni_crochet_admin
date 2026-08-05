import { supabase } from './supabase'
import type { Promotion, UserPromotion, UserPromotionStatus } from './vouchers'

export type CustomerFilter = 'all' | 'with_phone' | 'without_phone' | 'has_voucher'

export interface CustomerProfile {
  id: string
  zalo_user_id: string
  display_name: string | null
  avatar_url: string | null
  phone: string | null
  created_at: string
  updated_at: string
  last_seen_at: string | null
}

export interface CustomerPromotion extends UserPromotion {
  promotions?: Promotion | Promotion[] | null
}

export interface Customer {
  id: string
  display_name: string
  avatar_url: string | null
  phone: string | null
  zalo_user_id: string | null
  voucher_count: number
  used_voucher_count: number
  last_activity_at: string | null
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

const CUSTOMER_PROFILE_SELECT = `
  id,
  zalo_user_id,
  display_name,
  avatar_url,
  phone,
  created_at,
  updated_at,
  last_seen_at
`

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
    if (type === 'with_phone') return Boolean(customer.phone)
    if (type === 'without_phone') return !customer.phone
    if (type === 'has_voucher') return customer.voucher_count > 0
    return true
  })
}

const toCustomer = (profile: CustomerProfile): Customer => ({
  id: profile.id,
  display_name: profile.display_name?.trim() || 'Khách chưa rõ tên',
  avatar_url: profile.avatar_url,
  phone: profile.phone,
  zalo_user_id: profile.zalo_user_id,
  voucher_count: 0,
  used_voucher_count: 0,
  last_activity_at: profile.last_seen_at ?? profile.updated_at ?? profile.created_at,
  user_promotions: [],
})

const updateLastActivity = (customer: Customer, value: string) => {
  if (!customer.last_activity_at || new Date(value) > new Date(customer.last_activity_at)) {
    customer.last_activity_at = value
  }
}

export const customerServices = {
  getCustomers: async (filters: CustomerFilters): Promise<Customer[]> => {
    const [profilesResult, userPromotionsResult] = await Promise.all([
      supabase
        .from('customer_profiles')
        .select(CUSTOMER_PROFILE_SELECT)
        .order('last_seen_at', { ascending: false }),
      supabase
        .from('user_promotions')
        .select(CUSTOMER_PROMOTION_SELECT)
        .order('created_at', { ascending: false }),
    ])

    if (profilesResult.error) {
      throw new Error(profilesResult.error.message)
    }

    if (userPromotionsResult.error) {
      throw new Error(userPromotionsResult.error.message)
    }

    const customers = new Map<string, Customer>(
      ((profilesResult.data ?? []) as CustomerProfile[]).map((profile) => [profile.zalo_user_id, toCustomer(profile)]),
    )
    const userPromotions = (userPromotionsResult.data ?? []) as CustomerPromotion[]

    userPromotions.forEach((userPromotion) => {
      const customer = customers.get(userPromotion.zalo_user_id)
      if (!customer) return

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
