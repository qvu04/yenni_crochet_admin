import type { Order, OrderItem, OrderStatus, OrderStatusFilter } from '../services'

export const orderStatusOptions: Array<{ label: string; value: OrderStatusFilter }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chờ xác nhận', value: 'pending' },
  { label: 'Đã xác nhận', value: 'confirmed' },
  { label: 'Hoàn thành', value: 'done' },
  { label: 'Đã hủy', value: 'cancelled' },
]

export const editableOrderStatusOptions: Array<{ label: string; value: OrderStatus }> = [
  { label: 'Chờ xác nhận', value: 'pending' },
  { label: 'Đã xác nhận', value: 'confirmed' },
  { label: 'Hoàn thành', value: 'done' },
  { label: 'Đã hủy', value: 'cancelled' },
]

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  done: 'Hoàn thành',
  cancelled: 'Đã hủy',
}

export const getOrderStatusTone = (status: OrderStatus) => {
  if (status === 'done') return 'success'
  if (status === 'cancelled') return 'danger'
  if (status === 'confirmed') return 'info'
  return 'warning'
}

export const normalizeOrderStatus = (value: string | null): OrderStatusFilter =>
  value === 'pending' || value === 'confirmed' || value === 'done' || value === 'cancelled'
    ? value
    : 'all'

export const getOrderTotal = (order: Order) => Number(order.final_price ?? order.subtotal_price ?? 0)

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
