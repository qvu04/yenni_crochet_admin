import type { Campaign, CampaignCtaAction, CampaignStatusFilter, CampaignType, CampaignTypeFilter } from '../services'

export const campaignStatusOptions: Array<{ label: string; value: CampaignStatusFilter }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Đang diễn ra', value: 'current' },
  { label: 'Sắp tới', value: 'upcoming' },
  { label: 'Đã kết thúc', value: 'ended' },
  { label: 'Đang bật', value: 'active' },
  { label: 'Đã tắt', value: 'inactive' },
]

export const campaignTypeFilterOptions: Array<{ label: string; value: CampaignTypeFilter }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Bộ sưu tập', value: 'collection' },
  { label: 'Sự kiện', value: 'event' },
  { label: 'Khuyến mãi', value: 'promotion' },
]

export const campaignTypeOptions: Array<{ label: string; value: CampaignType }> = [
  { label: 'Bộ sưu tập', value: 'collection' },
  { label: 'Sự kiện', value: 'event' },
  { label: 'Khuyến mãi', value: 'promotion' },
]

export const campaignCtaActionOptions: Array<{ label: string; value: CampaignCtaAction }> = [
  { label: 'Sản phẩm', value: 'products' },
  { label: 'Liên hệ', value: 'contact' },
  { label: 'Đặt riêng', value: 'custom_request' },
]

export const campaignTypeLabels: Record<CampaignType, string> = {
  collection: 'Bộ sưu tập',
  event: 'Sự kiện',
  promotion: 'Khuyến mãi',
}

export const campaignCtaActionLabels: Record<CampaignCtaAction, string> = {
  products: 'Sản phẩm',
  contact: 'Liên hệ',
  custom_request: 'Đặt riêng',
}

export const defaultCampaignValues = {
  name: '',
  subtitle: '',
  description: '',
  content: '',
  banner_url: '',
  detail_image_url: '',
  campaign_type: 'collection' as CampaignType,
  event_location: '',
  start_date: new Date().toISOString().slice(0, 10),
  end_date: new Date().toISOString().slice(0, 10),
  start_at: '',
  end_at: '',
  cta_label: '',
  cta_action: 'products' as CampaignCtaAction,
  is_active: true,
  product_ids: [],
}

export const normalizeCampaignStatus = (value: string | null): CampaignStatusFilter =>
  value === 'active' ||
  value === 'inactive' ||
  value === 'current' ||
  value === 'upcoming' ||
  value === 'ended'
    ? value
    : 'all'

export const normalizeCampaignType = (value: string | null): CampaignTypeFilter =>
  value === 'collection' || value === 'event' || value === 'promotion' ? value : 'all'

export const getCampaignStatus = (campaign: Campaign) => {
  const now = new Date()
  const start = new Date(campaign.start_at ?? campaign.start_date)
  const end = new Date(campaign.end_at ?? campaign.end_date)

  if (campaign.is_active === false) return { label: 'Đã tắt', tone: 'danger' as const }
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return { label: 'Đang mở', tone: 'info' as const }
  if (now < start) return { label: 'Sắp diễn ra', tone: 'info' as const }
  if (now > end) return { label: 'Đã kết thúc', tone: 'neutral' as const }
  return { label: 'Đang diễn ra', tone: 'success' as const }
}

export const getCampaignProducts = (campaign: Campaign) =>
  campaign.campaign_products
    ?.flatMap((item) => {
      if (!item.products) return []
      return Array.isArray(item.products) ? item.products : [item.products]
    }) ?? []
