import type {
  Promotion,
  PromotionDiscountType,
  PromotionFilter,
  PromotionVisibility,
  PromotionVisibilityFilter,
} from '../services'
import { formatCurrency } from './common'

export const promotionFilterOptions: Array<{ label: string; value: PromotionFilter }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Đang chạy', value: 'current' },
  { label: 'Sắp tới', value: 'upcoming' },
  { label: 'Hết hạn', value: 'expired' },
  { label: 'Đang bật', value: 'active' },
  { label: 'Đã tắt', value: 'inactive' },
]

export const promotionDiscountTypeOptions: Array<{ label: string; value: PromotionDiscountType }> = [
  { label: 'Phần trăm', value: 'percent' },
  { label: 'Số tiền', value: 'fixed' },
  { label: 'Miễn ship', value: 'free_shipping' },
]

export const promotionVisibilityOptions: Array<{ label: string; value: PromotionVisibility }> = [
  { label: 'Riêng tư', value: 'private' },
  { label: 'Công khai', value: 'public' },
]

export const promotionVisibilityFilterOptions: Array<{ label: string; value: PromotionVisibilityFilter }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Riêng tư', value: 'private' },
  { label: 'Công khai', value: 'public' },
]

export const promotionDiscountTypeLabels: Record<PromotionDiscountType, string> = {
  percent: 'Phần trăm',
  fixed: 'Số tiền',
  free_shipping: 'Miễn ship',
}

export const promotionVisibilityLabels: Record<PromotionVisibility, string> = {
  private: 'Riêng tư',
  public: 'Công khai',
}

export const defaultPromotionValues = {
  title: '',
  code: '',
  description: '',
  visibility: 'private' as PromotionVisibility,
  discount_type: 'percent' as PromotionDiscountType,
  discount_value: 10,
  min_order_value: null,
  max_order_value: null,
  max_discount_value: null,
  banner_url: '',
  campaign_id: '',
  start_date: new Date().toISOString().slice(0, 10),
  end_date: new Date().toISOString().slice(0, 10),
  usage_limit: null,
  is_active: true,
}

export const normalizePromotionFilter = (value: string | null): PromotionFilter =>
  value === 'active' ||
  value === 'inactive' ||
  value === 'current' ||
  value === 'upcoming' ||
  value === 'expired'
    ? value
    : 'all'

export const normalizePromotionVisibility = (value: string | null): PromotionVisibilityFilter =>
  value === 'public' || value === 'private' ? value : 'all'

export const getPromotionStatus = (promotion: Promotion) => {
  const today = new Date().toISOString().slice(0, 10)

  if (!promotion.is_active) return { label: 'Đã tắt', tone: 'danger' as const }
  if (promotion.end_date < today) return { label: 'Hết hạn', tone: 'neutral' as const }
  if (promotion.start_date > today) return { label: 'Sắp tới', tone: 'info' as const }
  return { label: 'Đang chạy', tone: 'success' as const }
}

export const getPromotionClaimedCount = (promotion: Promotion) => promotion.user_promotions?.length ?? 0

export const getPromotionUsedCount = (promotion: Promotion) =>
  promotion.user_promotions?.filter((item) => item.status === 'used').length ?? promotion.used_count ?? 0

export const formatPromotionDiscount = (promotion: Pick<Promotion, 'discount_type' | 'discount_value' | 'max_discount_value'>) => {
  if (promotion.discount_type === 'free_shipping') return 'Miễn phí vận chuyển'
  if (promotion.discount_type === 'fixed') return `Giảm ${formatCurrency(promotion.discount_value)}`

  return promotion.max_discount_value
    ? `Giảm ${promotion.discount_value}% tối đa ${formatCurrency(promotion.max_discount_value)}`
    : `Giảm ${promotion.discount_value}%`
}
