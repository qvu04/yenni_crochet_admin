import { Link } from 'react-router-dom'
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui'
import type { DashboardCustomRequest, DashboardOrder } from '../../../services'
import {
  cn,
  formatCurrency,
  formatDate,
  formatDateTime,
  getCustomRequestBudgetLabel,
  getOrderItemsText,
  getOrderRevenue,
  getOrderStatusLabel,
  statusTone,
} from '../../../utils'

const requestStatusLabels: Record<string, string> = {
  pending: 'Chưa liên hệ',
  contacted: 'Đã liên hệ',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
}

export const RecentActivitySection = ({
  recentOrders,
  recentRequests,
}: {
  recentOrders: DashboardOrder[]
  recentRequests: DashboardCustomRequest[]
}) => (
  <section className="grid gap-6 xl:grid-cols-2">
    <RecentOrdersTable orders={recentOrders} />
    <RecentRequestsTable requests={recentRequests} />
  </section>
)

const RecentOrdersTable = ({ orders }: { orders: DashboardOrder[] }) => (
  <Card>
    <CardHeader>
      <div>
        <CardTitle>Đơn hàng mới nhất</CardTitle>
        <CardDescription>Danh sách nhanh để xử lý đơn trong ngày.</CardDescription>
      </div>
      <Link
        to="/orders"
        className="hidden h-9 items-center rounded-admin px-3 text-xs font-bold text-muted transition hover:bg-cream hover:text-ink sm:inline-flex"
      >
        Xem tất cả
      </Link>
    </CardHeader>
    <CardContent>
      {orders.length ? (
        <div className="overflow-x-auto rounded-admin border border-berry/10">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-cream text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Sản phẩm</th>
                <th className="px-4 py-3">Tổng</th>
                <th className="px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-berry/10">
              {orders.map((order) => (
                <tr key={order.id} className="bg-white">
                  <td className="px-4 py-4">
                    <p className="font-black text-ink">{order.customer_name}</p>
                    <p className="mt-1 text-xs font-bold text-muted">{formatDateTime(order.created_at)}</p>
                  </td>
                  <td className="max-w-64 px-4 py-4 text-muted">
                    <p className="truncate">{getOrderItemsText(order)}</p>
                  </td>
                  <td className="px-4 py-4 font-black text-ink">{formatCurrency(getOrderRevenue(order))}</td>
                  <td className="px-4 py-4">
                    <Badge tone={statusTone(order.status)}>{getOrderStatusLabel(order)}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState text="Chưa có đơn hàng nào trong dữ liệu dashboard." />
      )}
    </CardContent>
  </Card>
)

const RecentRequestsTable = ({ requests }: { requests: DashboardCustomRequest[] }) => (
  <Card>
    <CardHeader>
      <div>
        <CardTitle>Yêu cầu đặt riêng</CardTitle>
        <CardDescription>Theo dõi khách cần tư vấn mẫu crochet riêng.</CardDescription>
      </div>
      <Link
        to="/custom-requests"
        className="hidden h-9 items-center rounded-admin px-3 text-xs font-bold text-muted transition hover:bg-cream hover:text-ink sm:inline-flex"
      >
        Xem tất cả
      </Link>
    </CardHeader>
    <CardContent className="space-y-3">
      {requests.length ? (
        requests.map((request) => (
          <div key={request.id} className="rounded-admin border border-berry/10 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-ink">{request.customer_name}</p>
                <p className="mt-1 text-xs font-bold text-muted">{request.phone} · {formatDateTime(request.created_at)}</p>
              </div>
              <Badge tone={statusTone(request.status)}>{requestStatusLabels[request.status] ?? request.status}</Badge>
            </div>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">
              {request.occasion ? `${request.occasion} · ` : ''}
              {request.description ?? 'Khách chưa nhập mô tả.'}
            </p>
            <p className="mt-2 text-xs font-bold text-muted">
              {getCustomRequestBudgetLabel(request)}
              {request.expected_date ? ` · Cần trước ${formatDate(request.expected_date)}` : ''}
            </p>
          </div>
        ))
      ) : (
        <EmptyState text="Chưa có yêu cầu đặt riêng nào." />
      )}
    </CardContent>
  </Card>
)

const EmptyState = ({ text }: { text: string }) => (
  <div className={cn('rounded-admin border border-dashed border-berry/20 bg-cream px-4 py-8 text-center text-sm font-bold text-muted')}>
    {text}
  </div>
)
