import type { Customer, CustomerFilter, CustomerPromotion, UserPromotionStatus } from '../services'
import { customerServices } from '../services'

export const customerFilterOptions: Array<{ label: string; value: CustomerFilter }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Có Zalo', value: 'with_zalo' },
  { label: 'Chưa có Zalo', value: 'without_zalo' },
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
  value === 'with_zalo' || value === 'without_zalo' || value === 'has_voucher' ? value : 'all'

export const getCustomerIdentifier = (customer: Customer) =>
  customer.zalo_user_id ? `Zalo: ${customer.zalo_user_id}` : customer.phone ? `SĐT: ${customer.phone}` : 'Chưa có định danh'

export const getCustomerPromotionTitle = (userPromotion: CustomerPromotion) => {
  const promotion = customerServices.getPromotionFromRelation(userPromotion)
  return promotion ? `${promotion.title} (${promotion.code})` : userPromotion.promotion_id
}
