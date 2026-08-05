import type { CustomRequest, CustomRequestStatus, CustomRequestStatusFilter } from '../services'

export const customRequestStatusOptions: Array<{ label: string; value: CustomRequestStatusFilter }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chưa liên hệ', value: 'pending' },
  { label: 'Đã liên hệ', value: 'contacted' },
  { label: 'Hoàn thành', value: 'completed' },
  { label: 'Đã hủy', value: 'cancelled' },
]

export const editableCustomRequestStatusOptions: Array<{ label: string; value: CustomRequestStatus }> = [
  { label: 'Chưa liên hệ', value: 'pending' },
  { label: 'Đã liên hệ', value: 'contacted' },
  { label: 'Hoàn thành', value: 'completed' },
  { label: 'Đã hủy', value: 'cancelled' },
]

export const customRequestStatusLabels: Record<CustomRequestStatus, string> = {
  pending: 'Chưa liên hệ',
  contacted: 'Đã liên hệ',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
}

export const occasionLabels: Record<string, string> = {
  birthday: 'Sinh nhật',
  anniversary: 'Kỷ niệm',
  holiday: 'Dịp lễ',
  other: 'Khác',
}

export const budgetRangeLabels: Record<string, string> = {
  under_100k: 'Dưới 100k',
  '100k_200k': '100k - 200k',
  '200k_500k': '200k - 500k',
  over_500k: 'Trên 500k',
  need_consult: 'Cần tư vấn',
}

export const getCustomRequestStatusTone = (status: CustomRequestStatus) => {
  if (status === 'completed') return 'success'
  if (status === 'cancelled') return 'danger'
  if (status === 'contacted') return 'info'
  return 'warning'
}

export const normalizeCustomRequestStatus = (value: string | null): CustomRequestStatusFilter =>
  value === 'pending' || value === 'contacted' || value === 'completed' || value === 'cancelled'
    ? value
    : 'all'

export const getCustomRequestOccasionLabel = (request: Pick<CustomRequest, 'occasion'>) =>
  request.occasion ? occasionLabels[request.occasion] ?? request.occasion : 'Không có'

export const getCustomRequestBudgetLabel = (request: Pick<CustomRequest, 'budget_range'>) =>
  request.budget_range ? budgetRangeLabels[request.budget_range] ?? request.budget_range : 'Chưa chọn'
