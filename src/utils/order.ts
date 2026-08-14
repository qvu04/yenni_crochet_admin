import type { Order, OrderItem, OrderStatus, OrderStatusFilter } from '../services'

export const orderStatusOptions: Array<{ label: string; value: OrderStatusFilter }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chờ xác nhận', value: 'awaiting_confirmation' },
  { label: 'Đã xác nhận', value: 'confirmed' },
  { label: 'Đang làm', value: 'making' },
  { label: 'Đang giao', value: 'shipping' },
  { label: 'Hoàn thành', value: 'done' },
  { label: 'Đã hủy', value: 'cancelled' },
]

export const editableOrderStatusOptions: Array<{ label: string; value: OrderStatus }> = [
  { label: 'Đã cọc, chờ shop xác nhận', value: 'awaiting_confirmation' },
  { label: 'Shop đã xác nhận', value: 'confirmed' },
  { label: 'Đang làm', value: 'making' },
  { label: 'Đang giao', value: 'shipping' },
  { label: 'Hoàn thành', value: 'done' },
  { label: 'Đã hủy', value: 'cancelled' },
]

export const orderStatusLabels: Record<OrderStatus, string> = {
  awaiting_confirmation: 'Đã cọc, chờ shop xác nhận',
  confirmed: 'Shop đã xác nhận',
  making: 'Đang làm',
  shipping: 'Đang giao',
  done: 'Hoàn thành',
  cancelled: 'Đã hủy',
}

export const paymentStatusLabels = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  failed: 'Thanh toán lỗi',
  refunded: 'Đã hoàn tiền',
} as const

export const paymentTypeLabels = {
  deposit: 'Đặt cọc',
  full: 'Thanh toán đủ',
  none: 'Chưa thanh toán',
} as const

export const isCancelledOrder = (order: Pick<Order, 'status'>) => order.status === 'cancelled'

export const isCompletedOrder = (order: Pick<Order, 'status'>) => order.status === 'done'

export const isAwaitingConfirmationOrder = (order: Pick<Order, 'status'>) => order.status === 'awaiting_confirmation'

export const getOrderStatusLabel = (order: Pick<Order, 'status' | 'payment_status'>) => {
  if (isCancelledOrder(order)) return orderStatusLabels.cancelled
  if (isCompletedOrder(order)) return orderStatusLabels.done
  return orderStatusLabels[order.status] ?? 'Đang xử lý'
}

export const getOrderStatusTone = (orderOrStatus: Order | OrderStatus) => {
  const order = typeof orderOrStatus === 'string' ? null : orderOrStatus
  const status = typeof orderOrStatus === 'string' ? orderOrStatus : orderOrStatus.status

  if (status === 'done') return 'success'
  if (status === 'cancelled' || order?.payment_status === 'failed') return 'danger'
  if (status === 'confirmed' || status === 'shipping') return 'info'
  return 'warning'
}

export const normalizeOrderStatus = (value: string | null): OrderStatusFilter =>
  value === 'awaiting_confirmation' ||
  value === 'confirmed' ||
  value === 'making' ||
  value === 'shipping' ||
  value === 'done' ||
  value === 'cancelled'
    ? value
    : 'all'

export const getOrderTotal = (order: Order) => Number(order.final_price ?? order.subtotal_price ?? 0)

export const getOrderDepositAmount = (order: Order) => Number(order.deposit_amount ?? 0)

export const getOrderRemainingAmount = (order: Order) =>
  Number(order.remaining_amount ?? Math.max(getOrderTotal(order) - getOrderDepositAmount(order), 0))

export const getShortOrderCode = (orderId: string) => orderId.slice(0, 8).toUpperCase()

export const getOrderItemProduct = (item: OrderItem) =>
  Array.isArray(item.products) ? item.products[0] : item.products

export const getOrderItemsSummary = (order: Order) => {
  const items = order.order_items ?? []

  if (!items.length) {
    return `${order.quantity} sản phẩm`
  }

  return items
    .slice(0, 2)
    .map((item) => {
      const product = getOrderItemProduct(item)
      const variant = item.variant_color_name || item.variant_name
      return `${product?.name ?? 'Sản phẩm'}${variant ? ` - ${variant}` : ''} x ${item.quantity}`
    })
    .join(', ')
}
