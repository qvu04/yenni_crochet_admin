import { AiOutlineEye, AiOutlineInbox, AiOutlineLoading3Quarters } from 'react-icons/ai'
import { Badge, Button } from '../../../components/ui'
import type { Order } from '../../../services'
import {
  formatCurrency,
  formatDateTime,
  getOrderItemsSummary,
  getOrderStatusTone,
  getOrderTotal,
  orderStatusLabels,
} from '../../../utils'

interface OrdersTableProps {
  orders: Order[]
  isLoading: boolean
  isError: boolean
  highlightedOrderId?: string | null
  onRetry: () => void
  onView: (order: Order) => void
}

export const OrdersTable = ({
  orders,
  isLoading,
  isError,
  highlightedOrderId,
  onRetry,
  onView,
}: OrdersTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-admin border border-dashed border-berry/20 bg-cream py-14 text-sm font-bold text-muted">
        <AiOutlineLoading3Quarters className="mr-2 animate-spin text-xl text-berry" />
        Đang tải đơn hàng...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-admin border border-berry/20 bg-berry/10 p-5">
        <p className="font-black text-berry">Không tải được đơn hàng</p>
        <p className="mt-1 text-sm text-muted">Kiểm tra quyền admin hoặc RLS của bảng orders/order_items.</p>
        <Button className="mt-4" variant="secondary" onClick={onRetry}>
          Tải lại
        </Button>
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className="rounded-admin border border-dashed border-berry/20 bg-cream px-5 py-14 text-center">
        <AiOutlineInbox className="mx-auto text-4xl text-berry" />
        <p className="mt-3 font-black text-ink">Chưa có đơn hàng phù hợp</p>
        <p className="mt-1 text-sm text-muted">Thử đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-admin border border-berry/10">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="bg-cream text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-3">Khách hàng</th>
            <th className="px-4 py-3">Sản phẩm</th>
            <th className="px-4 py-3">Tổng tiền</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Ngày tạo</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-berry/10 bg-white">
          {orders.map((order) => (
            <tr
              key={order.id}
              data-order-row-id={order.id}
              className={order.id === highlightedOrderId ? 'bg-mint/60 transition-colors' : 'transition-colors'}
            >
              <td className="px-4 py-4">
                <p className="font-black text-ink">{order.customer_name}</p>
                <p className="mt-1 text-xs font-bold text-muted">{order.phone}</p>
              </td>
              <td className="max-w-72 px-4 py-4 text-muted">
                <p className="truncate">{getOrderItemsSummary(order)}</p>
                <p className="mt-1 text-xs font-bold text-muted">{order.quantity} sản phẩm</p>
              </td>
              <td className="px-4 py-4 font-black text-ink">{formatCurrency(getOrderTotal(order))}</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <Badge tone={getOrderStatusTone(order.status)}>{orderStatusLabels[order.status]}</Badge>
                  {order.id === highlightedOrderId ? <Badge tone="success">Vừa lưu</Badge> : null}
                </div>
              </td>
              <td className="px-4 py-4 text-muted">{formatDateTime(order.created_at)}</td>
              <td className="px-4 py-4">
                <div className="flex justify-end">
                  <Button size="sm" variant="ghost" onClick={() => onView(order)}>
                    <AiOutlineEye className="text-lg" />
                    Chi tiết
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
