import type { DashboardOrder, DashboardProduct } from '../services';
import { addDays, addMonths, formatDate, startOfDay, startOfWeek, toDateKey, toMonthKey } from './common';

export type RevenuePeriod = 'day' | 'week' | 'month'

export interface RevenuePoint {
    label: string
    value: number
}

export const statusTone = (status: string) => {
    if (status === 'done') return 'success'
    if (status === 'cancelled') return 'danger'
    if (status === 'confirmed' || status === 'shipping' || status === 'contacted') return 'info'
    return 'warning'
};
export const getOrderRevenue = (order: DashboardOrder) => Number(order.final_price ?? order.subtotal_price ?? 0);

const isCancelledDashboardOrder = (order: DashboardOrder) => order.status === 'cancelled'

export const getTodayOrders = (orders: DashboardOrder[]) => {
    const todayKey = toDateKey(new Date())
    return orders.filter((order) => toDateKey(new Date(order.created_at)) === todayKey)
}

export const getProductInventoryQuantity = (product: DashboardProduct) => {
    const activeVariants = product.product_variants?.filter((variant) => variant.is_active) ?? []

    if (activeVariants.length) {
        return activeVariants.reduce((total, variant) => total + variant.stock_quantity, 0)
    }

    return product.stock_quantity
};
export const getOrderItemsText = (order: DashboardOrder) => {
    const items = order.order_items ?? []

    if (!items.length) {
        return `${order.quantity} sản phẩm`
    }

    return items
        .slice(0, 2)
        .map((item) => {
            const product = Array.isArray(item.products) ? item.products[0] : item.products
            const variant = item.variant_color_name || item.variant_name
            return `${product?.name ?? 'Sản phẩm'}${variant ? ` - ${variant}` : ''} x ${item.quantity}`
        })
        .join(', ')
};

export const buildRevenueSeries = (orders: DashboardOrder[], period: RevenuePeriod): RevenuePoint[] => {
    const paidOrders = orders.filter((order) => !isCancelledDashboardOrder(order))
    const today = startOfDay(new Date())

    if (period === 'month') {
        const firstMonth = new Date(today.getFullYear(), today.getMonth() - 11, 1)
        const buckets = Array.from({ length: 12 }, (_, index) => {
            const date = addMonths(firstMonth, index)
            return {
                key: toMonthKey(date),
                label: `T${date.getMonth() + 1}/${date.getFullYear()}`,
                value: 0,
            }
        })
        const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]))

        paidOrders.forEach((order) => {
            const bucket = bucketMap.get(toMonthKey(new Date(order.created_at)))
            if (bucket) bucket.value += getOrderRevenue(order)
        })

        return buckets
    }

    if (period === 'week') {
        const currentWeek = startOfWeek(today)
        const firstWeek = addDays(currentWeek, -7 * 7)
        const buckets = Array.from({ length: 8 }, (_, index) => {
            const date = addDays(firstWeek, index * 7)
            const endDate = addDays(date, 6)
            return {
                key: toDateKey(date),
                label: `${formatDate(date).slice(0, 5)}-${formatDate(endDate).slice(0, 5)}`,
                value: 0,
            }
        })
        const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]))

        paidOrders.forEach((order) => {
            const bucket = bucketMap.get(toDateKey(startOfWeek(new Date(order.created_at))))
            if (bucket) bucket.value += getOrderRevenue(order)
        })

        return buckets
    }

    const firstDay = addDays(today, -13)
    const buckets = Array.from({ length: 14 }, (_, index) => {
        const date = addDays(firstDay, index)
        return {
            key: toDateKey(date),
            label: formatDate(date).slice(0, 5),
            value: 0,
        }
    })
    const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]))

    paidOrders.forEach((order) => {
        const bucket = bucketMap.get(toDateKey(new Date(order.created_at)))
        if (bucket) bucket.value += getOrderRevenue(order)
    })

    return buckets
}
