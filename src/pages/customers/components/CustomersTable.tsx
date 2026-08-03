import { AiOutlineEye, AiOutlineGift, AiOutlineLoading3Quarters, AiOutlineTeam } from 'react-icons/ai'
import { Badge, Button } from '../../../components/ui'
import type { Customer } from '../../../services'
import { formatCurrency, formatDateTime, getCustomerIdentifier } from '../../../utils'

interface CustomersTableProps {
  customers: Customer[]
  isLoading: boolean
  isError: boolean
  highlightedCustomerId?: string | null
  onRetry: () => void
  onView: (customer: Customer) => void
  onGrantVoucher: (customer: Customer) => void
}

export const CustomersTable = ({
  customers,
  isLoading,
  isError,
  highlightedCustomerId,
  onRetry,
  onView,
  onGrantVoucher,
}: CustomersTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-admin border border-dashed border-berry/20 bg-cream py-14 text-sm font-bold text-muted">
        <AiOutlineLoading3Quarters className="mr-2 animate-spin text-xl text-berry" />
        Đang tổng hợp khách hàng...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-admin border border-berry/20 bg-berry/10 p-5">
        <p className="font-black text-berry">Không tải được khách hàng</p>
        <p className="mt-1 text-sm text-muted">Kiểm tra quyền admin với orders, custom_requests và user_promotions.</p>
        <Button className="mt-4" variant="secondary" onClick={onRetry}>
          Tải lại
        </Button>
      </div>
    )
  }

  if (!customers.length) {
    return (
      <div className="rounded-admin border border-dashed border-berry/20 bg-cream px-5 py-14 text-center">
        <AiOutlineTeam className="mx-auto text-4xl text-berry" />
        <p className="mt-3 font-black text-ink">Chưa có khách hàng phù hợp</p>
        <p className="mt-1 text-sm text-muted">Thử đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-admin border border-berry/10">
      <table className="w-full min-w-[1080px] text-left text-sm">
        <thead className="bg-cream text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-3">Khách hàng</th>
            <th className="px-4 py-3">Đơn hàng</th>
            <th className="px-4 py-3">Tổng chi tiêu</th>
            <th className="px-4 py-3">Đặt riêng</th>
            <th className="px-4 py-3">Voucher</th>
            <th className="px-4 py-3">Gần nhất</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-berry/10 bg-white">
          {customers.map((customer) => (
            <tr
              key={customer.id}
              data-customer-row-id={customer.id}
              className={customer.id === highlightedCustomerId ? 'bg-mint/60 transition-colors' : 'transition-colors'}
            >
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blush text-sm font-black text-ink ring-1 ring-berry/10">
                    {customer.display_name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-black text-ink">{customer.display_name}</p>
                      {customer.id === highlightedCustomerId ? <Badge tone="success">Vừa cấp</Badge> : null}
                    </div>
                    <p className="mt-1 text-xs font-bold text-muted">{getCustomerIdentifier(customer)}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-muted">
                <p className="font-black text-ink">{customer.order_count} đơn</p>
                <p className="mt-1 text-xs font-bold">{customer.completed_order_count} hoàn thành</p>
              </td>
              <td className="px-4 py-4 font-black text-ink">{formatCurrency(customer.total_spent)}</td>
              <td className="px-4 py-4 font-black text-ink">{customer.custom_request_count}</td>
              <td className="px-4 py-4 text-muted">
                <p className="font-black text-ink">{customer.voucher_count} voucher</p>
                <p className="mt-1 text-xs font-bold">{customer.used_voucher_count} đã dùng</p>
              </td>
              <td className="px-4 py-4 text-muted">
                {customer.last_activity_at ? formatDateTime(customer.last_activity_at) : 'Chưa có'}
              </td>
              <td className="px-4 py-4">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => onView(customer)}>
                    <AiOutlineEye className="text-lg" />
                    Chi tiết
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={!customer.zalo_user_id}
                    onClick={() => onGrantVoucher(customer)}
                  >
                    <AiOutlineGift className="text-lg" />
                    Cấp voucher
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
