import type { CampaignFormValues } from '../schemas'
import type { Product } from './products'
import { supabase } from './supabase'

const CAMPAIGN_STORAGE_BUCKET = 'Products'
const CAMPAIGN_IMAGES_FOLDER = 'campaigns'
const MAX_CAMPAIGN_IMAGE_SIZE = 5 * 1024 * 1024

export type CampaignType = 'collection' | 'event' | 'promotion'
export type CampaignCtaAction = 'products' | 'contact' | 'custom_request'
export type CampaignStatusFilter = 'all' | 'active' | 'inactive' | 'current' | 'upcoming' | 'ended'
export type CampaignTypeFilter = 'all' | CampaignType

export interface CampaignProduct {
  campaign_id: string
  product_id: string
  products?: Product | Product[] | null
}

export interface Campaign {
  id: string
  name: string
  banner_url: string
  start_date: string
  end_date: string
  campaign_type: CampaignType | null
  subtitle: string | null
  description: string | null
  content: string | null
  detail_image_url: string | null
  event_location: string | null
  start_at: string | null
  end_at: string | null
  cta_label: string | null
  cta_action: CampaignCtaAction | null
  is_active: boolean | null
  created_at: string
  campaign_products?: CampaignProduct[] | null
}

export interface CampaignFilters {
  search?: string
  status?: CampaignStatusFilter
  type?: CampaignTypeFilter
}

const CAMPAIGN_SELECT = `
  *,
  campaign_products(campaign_id, product_id, products(id, name, price, images, is_active, is_pre_order, product_type, stock_quantity))
`

const normalizeSearchTerm = (value: string) => value.trim().replace(/[,%()]/g, ' ').replace(/\s+/g, ' ')

const getFileExtension = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return extension || 'jpg'
}

const toNullableIsoString = (value?: string) => (value ? new Date(value).toISOString() : null)

const toCampaignPayload = (values: CampaignFormValues) => ({
  name: values.name.trim(),
  subtitle: values.subtitle?.trim() || null,
  description: values.description?.trim() || null,
  content: values.content?.trim() || null,
  banner_url: values.banner_url.trim(),
  detail_image_url: values.detail_image_url?.trim() || null,
  campaign_type: values.campaign_type,
  event_location: values.event_location?.trim() || null,
  start_date: values.start_date,
  end_date: values.end_date,
  start_at: toNullableIsoString(values.start_at),
  end_at: toNullableIsoString(values.end_at),
  cta_label: values.cta_label?.trim() || null,
  cta_action: values.cta_action,
  is_active: values.is_active,
})

const syncCampaignProducts = async (campaignId: string, productIds: string[]) => {
  const { error: deleteError } = await supabase
    .from('campaign_products')
    .delete()
    .eq('campaign_id', campaignId)

  if (deleteError) {
    throw new Error(deleteError.message)
  }

  if (!productIds.length) return

  const rows = productIds.map((productId) => ({
    campaign_id: campaignId,
    product_id: productId,
  }))
  const { error: insertError } = await supabase.from('campaign_products').insert(rows)

  if (insertError) {
    throw new Error(insertError.message)
  }
}

export const campaignServices = {
  getCampaigns: async ({ search, status = 'all', type = 'all' }: CampaignFilters): Promise<Campaign[]> => {
    const today = new Date().toISOString().slice(0, 10)
    let query = supabase.from('campaigns').select(CAMPAIGN_SELECT).order('start_date', { ascending: false })

    if (search?.trim()) {
      const keyword = normalizeSearchTerm(search)
      if (keyword) {
        query = query.or(`name.ilike.%${keyword}%,subtitle.ilike.%${keyword}%,description.ilike.%${keyword}%`)
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
    } else if (status === 'ended') {
      query = query.lt('end_date', today)
    }

    if (type !== 'all') {
      query = query.eq('campaign_type', type)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return (data ?? []) as Campaign[]
  },

  createCampaign: async (values: CampaignFormValues): Promise<Campaign> => {
    const { data, error } = await supabase
      .from('campaigns')
      .insert(toCampaignPayload(values))
      .select(CAMPAIGN_SELECT)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    await syncCampaignProducts(data.id, values.product_ids)

    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select(CAMPAIGN_SELECT)
      .eq('id', data.id)
      .single()

    if (campaignError) {
      throw new Error(campaignError.message)
    }

    return campaign as Campaign
  },

  updateCampaign: async (campaignId: string, values: CampaignFormValues): Promise<Campaign> => {
    const { error } = await supabase
      .from('campaigns')
      .update(toCampaignPayload(values))
      .eq('id', campaignId)

    if (error) {
      throw new Error(error.message)
    }

    await syncCampaignProducts(campaignId, values.product_ids)

    const { data, error: campaignError } = await supabase
      .from('campaigns')
      .select(CAMPAIGN_SELECT)
      .eq('id', campaignId)
      .single()

    if (campaignError) {
      throw new Error(campaignError.message)
    }

    return data as Campaign
  },

  setCampaignActive: async (campaignId: string, isActive: boolean): Promise<void> => {
    const { error } = await supabase.from('campaigns').update({ is_active: isActive }).eq('id', campaignId)

    if (error) {
      throw new Error(error.message)
    }
  },

  uploadCampaignImage: async (file: File): Promise<string> => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Chỉ hỗ trợ tải ảnh campaign.')
    }

    if (file.size > MAX_CAMPAIGN_IMAGE_SIZE) {
      throw new Error('Ảnh campaign tối đa 5MB.')
    }

    const path = `${CAMPAIGN_IMAGES_FOLDER}/${Date.now()}-${crypto.randomUUID()}.${getFileExtension(file.name)}`
    const { error } = await supabase.storage.from(CAMPAIGN_STORAGE_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (error) {
      throw new Error(error.message)
    }

    const { data } = supabase.storage.from(CAMPAIGN_STORAGE_BUCKET).getPublicUrl(path)
    return data.publicUrl
  },

  toCampaignFormValues: (campaign: Campaign): CampaignFormValues => ({
    name: campaign.name,
    subtitle: campaign.subtitle ?? '',
    description: campaign.description ?? '',
    content: campaign.content ?? '',
    banner_url: campaign.banner_url,
    detail_image_url: campaign.detail_image_url ?? '',
    campaign_type: campaign.campaign_type ?? 'collection',
    event_location: campaign.event_location ?? '',
    start_date: campaign.start_date,
    end_date: campaign.end_date,
    start_at: campaign.start_at ? campaign.start_at.slice(0, 16) : '',
    end_at: campaign.end_at ? campaign.end_at.slice(0, 16) : '',
    cta_label: campaign.cta_label ?? '',
    cta_action: campaign.cta_action ?? 'products',
    is_active: campaign.is_active ?? true,
    product_ids: campaign.campaign_products?.map((item) => item.product_id) ?? [],
  }),
}
