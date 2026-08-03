import type { PromotionFormValues } from '../schemas'
import { supabase } from './supabase'

const PROMOTION_STORAGE_BUCKET = 'Products'
const PROMOTION_BANNERS_FOLDER = 'vouchers'
const MAX_PROMOTION_BANNER_SIZE = 5 * 1024 * 1024

export type PromotionDiscountType = 'percent' | 'fixed' | 'free_shipping'
export type PromotionVisibility = 'public' | 'private'
export type PromotionFilter = 'all' | 'active' | 'inactive' | 'current' | 'upcoming' | 'expired'
export type PromotionVisibilityFilter = 'all' | PromotionVisibility
export type UserPromotionStatus = 'claimed' | 'used' | 'expired'

export interface UserPromotion {
  id: string
  promotion_id: string
  zalo_user_id: string
  status: UserPromotionStatus
  claimed_at: string
  used_at: string | null
  order_id: string | null
  created_at: string
}

export interface Promotion {
  id: string
  title: string
  description: string | null
  visibility: PromotionVisibility
  code: string
  discount_type: PromotionDiscountType
  discount_value: number
  min_order_value: number | null
  banner_url: string | null
  campaign_id: string | null
  start_date: string
  end_date: string
  usage_limit: number | null
  used_count: number
  is_active: boolean
  max_order_value: number | null
  max_discount_value: number | null
  created_at: string
  user_promotions?: UserPromotion[] | null
}

export interface PromotionFilters {
  search?: string
  status?: PromotionFilter
  visibility?: PromotionVisibilityFilter
}

const PROMOTION_SELECT = `
  *,
  user_promotions(id, promotion_id, zalo_user_id, status, claimed_at, used_at, order_id, created_at)
`

const normalizeSearchTerm = (value: string) => value.trim().replace(/[,%()]/g, ' ').replace(/\s+/g, ' ')

const getFileExtension = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return extension || 'jpg'
}

const toPromotionPayload = (values: PromotionFormValues) => ({
  title: values.title.trim(),
  code: values.code.trim().toUpperCase(),
  description: values.description?.trim() || null,
  visibility: values.visibility,
  discount_type: values.discount_type,
  discount_value: values.discount_type === 'free_shipping' ? 0 : values.discount_value,
  min_order_value: values.min_order_value,
  max_order_value: values.max_order_value,
  max_discount_value: values.discount_type === 'percent' ? values.max_discount_value : null,
  banner_url: values.banner_url?.trim() || null,
  campaign_id: values.campaign_id?.trim() || null,
  start_date: values.start_date,
  end_date: values.end_date,
  usage_limit: values.usage_limit,
  is_active: values.is_active,
})

export const voucherServices = {
  getPromotions: async ({ search, status = 'all', visibility = 'all' }: PromotionFilters): Promise<Promotion[]> => {
    const today = new Date().toISOString().slice(0, 10)
    let query = supabase.from('promotions').select(PROMOTION_SELECT).order('created_at', { ascending: false })

    if (search?.trim()) {
      const keyword = normalizeSearchTerm(search)
      if (keyword) {
        query = query.or(`title.ilike.%${keyword}%,code.ilike.%${keyword}%,description.ilike.%${keyword}%`)
      }
    }

    if (status === 'active') {
      query = query.eq('is_active', true)
    } else if (status === 'inactive') {
      query = query.eq('is_active', false)
    } else if (status === 'current') {
      query = query.eq('is_active', true).lte('start_date', today).gte('end_date', today)
    } else if (status === 'upcoming') {
      query = query.gte('start_date', today)
    } else if (status === 'expired') {
      query = query.lt('end_date', today)
    }

    if (visibility !== 'all') {
      query = query.eq('visibility', visibility)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return (data ?? []) as Promotion[]
  },

  createPromotion: async (values: PromotionFormValues): Promise<Promotion> => {
    const { data, error } = await supabase
      .from('promotions')
      .insert(toPromotionPayload(values))
      .select(PROMOTION_SELECT)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data as Promotion
  },

  updatePromotion: async (promotionId: string, values: PromotionFormValues): Promise<Promotion> => {
    const { data, error } = await supabase
      .from('promotions')
      .update(toPromotionPayload(values))
      .eq('id', promotionId)
      .select(PROMOTION_SELECT)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data as Promotion
  },

  setPromotionActive: async (promotionId: string, isActive: boolean): Promise<void> => {
    const { error } = await supabase.from('promotions').update({ is_active: isActive }).eq('id', promotionId)

    if (error) {
      throw new Error(error.message)
    }
  },

  uploadPromotionBanner: async (file: File): Promise<string> => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Chỉ hỗ trợ tải ảnh voucher.')
    }

    if (file.size > MAX_PROMOTION_BANNER_SIZE) {
      throw new Error('Ảnh voucher tối đa 5MB.')
    }

    const path = `${PROMOTION_BANNERS_FOLDER}/${Date.now()}-${crypto.randomUUID()}.${getFileExtension(file.name)}`
    const { error } = await supabase.storage.from(PROMOTION_STORAGE_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (error) {
      throw new Error(error.message)
    }

    const { data } = supabase.storage.from(PROMOTION_STORAGE_BUCKET).getPublicUrl(path)
    return data.publicUrl
  },

  toPromotionFormValues: (promotion: Promotion): PromotionFormValues => ({
    title: promotion.title,
    code: promotion.code,
    description: promotion.description ?? '',
    visibility: promotion.visibility ?? 'private',
    discount_type: promotion.discount_type,
    discount_value: promotion.discount_value,
    min_order_value: promotion.min_order_value,
    max_order_value: promotion.max_order_value,
    max_discount_value: promotion.max_discount_value,
    banner_url: promotion.banner_url ?? '',
    campaign_id: promotion.campaign_id ?? '',
    start_date: promotion.start_date,
    end_date: promotion.end_date,
    usage_limit: promotion.usage_limit,
    is_active: promotion.is_active,
  }),
}
