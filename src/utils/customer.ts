import type { Customer, CustomerFilter, CustomerPromotion, UserPromotionStatus } from '../services'
import { customerServices } from '../services'

export const customerFilterOptions: Array<{ label: string; value: CustomerFilter }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Có SĐT', value: 'with_phone' },
  { label: 'Chưa có SĐT', value: 'without_phone' },
  { label: 'Có voucher', value: 'has_voucher' },
]

export const customerVoucherStatusLabels: Record<UserPromotionStatus, string> = {
  claimed: 'Đã cấp',
  used: 'Đã dùng',
  expired: 'Hết hạn',
}

export const getCustomerVoucherStatusTone = (status: UserPromotionStatus) => {
  if (status === 'used') return 'success'
  if (status === 'expired') return 'danger'
  return 'info'
}

export const normalizeCustomerFilter = (value: string | null): CustomerFilter =>
  value === 'with_phone' || value === 'without_phone' || value === 'has_voucher' ? value : 'all'

export const getCustomerIdentifier = (customer: Customer) =>
  customer.phone ? customer.phone : customer.zalo_user_id ? `Zalo: ${customer.zalo_user_id}` : 'Chưa có định danh'

export const getCustomerPromotionTitle = (userPromotion: CustomerPromotion) => {
  const promotion = customerServices.getPromotionFromRelation(userPromotion)
  return promotion ? `${promotion.title} (${promotion.code})` : userPromotion.promotion_id
}
