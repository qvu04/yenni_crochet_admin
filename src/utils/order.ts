import type { Order, OrderItem, OrderStatus, OrderStatusFilter } from '../services'

export const orderStatusOptions: Array<{ label: string; value: OrderStatusFilter }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chờ cọc', value: 'waiting_payment' },
  { label: 'Đã cọc', value: 'paid_deposit' },
  { label: 'Đã nhận', value: 'confirmed' },
  { label: 'Đang làm', value: 'making' },
  { label: 'Đang giao', value: 'shipping' },
  { label: 'Hoàn thành', value: 'done' },
  { label: 'Đã hủy', value: 'cancelled' },
]

export const editableOrderStatusOptions: Array<{ label: string; value: OrderStatus }> = [
  { label: 'Chờ xử lý', value: 'pending' },
  { label: 'Đã nhận', value: 'confirmed' },
  { label: 'Đang làm', value: 'making' },
  { label: 'Đang giao', value: 'shipping' },
  { label: 'Hoàn thành', value: 'done' },
  { label: 'Đã hủy', value: 'cancelled' },
]

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: 'Shop đã nhận đơn',
  confirmed: 'Đã nhận',
  making: 'Đang làm',
  shipping: 'Đang giao',
  delivering: 'Đang giao',
  done: 'Hoàn thành',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  canceled: 'Đã hủy',
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

export const isCancelledOrder = (order: Pick<Order, 'status'>) => order.status === 'cancelled' || order.status === 'canceled'

export const isCompletedOrder = (order: Pick<Order, 'status'>) => order.status === 'done' || order.status === 'completed'

export const isWaitingPaymentOrder = (order: Pick<Order, 'status' | 'payment_status'>) =>
  order.status === 'pending' && order.payment_status === 'pending'

export const getOrderStatusLabel = (order: Pick<Order, 'status' | 'payment_status'>) => {
  if (isCancelledOrder(order)) return orderStatusLabels.cancelled
  if (isCompletedOrder(order)) return orderStatusLabels.done
  if (isWaitingPaymentOrder(order)) return 'Chờ đặt cọc'
  return orderStatusLabels[order.status] ?? 'Đang xử lý'
}

export const getOrderStatusTone = (orderOrStatus: Order | OrderStatus) => {
  const order = typeof orderOrStatus === 'string' ? null : orderOrStatus
  const status = typeof orderOrStatus === 'string' ? orderOrStatus : orderOrStatus.status

  if (status === 'done' || status === 'completed') return 'success'
  if (status === 'cancelled' || status === 'canceled' || order?.payment_status === 'failed') return 'danger'
  if (status === 'confirmed' || status === 'shipping' || status === 'delivering') return 'info'
  return 'warning'
}

export const normalizeOrderStatus = (value: string | null): OrderStatusFilter =>
  value === 'pending' ||
  value === 'waiting_payment' ||
  value === 'paid_deposit' ||
  value === 'confirmed' ||
  value === 'making' ||
  value === 'shipping' ||
  value === 'delivering' ||
  value === 'done' ||
  value === 'completed' ||
  value === 'cancelled' ||
  value === 'canceled'
    ? value
    : 'all'

export const getOrderTotal = (order: Order) => Number(order.final_price ?? order.subtotal_price ?? 0)

export const getOrderDepositAmount = (order: Order) => Number(order.deposit_amount ?? 0)

export const getOrderRemainingAmount = (order: Order) =>
  Number(order.remaining_amount ?? Math.max(getOrderTotal(order) - getOrderDepositAmount(order), 0))

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
