import { AiOutlineClose, AiOutlineGift } from 'react-icons/ai'
import { Badge, Button } from '../../../components/ui'
import type { Customer } from '../../../services'
import {
  customerVoucherStatusLabels,
  formatCurrency,
  formatDateTime,
  getCustomerIdentifier,
  getCustomerPromotionTitle,
  getCustomerVoucherStatusTone,
  getOrderTotal,
  orderStatusLabels,
} from '../../../utils'

interface CustomerDetailDialogProps {
  customer: Customer
  onClose: () => void
  onGrantVoucher: (customer: Customer) => void
}

export const CustomerDetailDialog = ({ customer, onClose, onGrantVoucher }: CustomerDetailDialogProps) => (
  <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/20 px-4 py-6 backdrop-blur-[2px]">
    <div className="mx-auto max-w-5xl rounded-admin bg-white shadow-soft ring-1 ring-berry/10">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-t-admin border-b border-berry/10 bg-white px-5 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Hồ sơ khách hàng</p>
          <h3 className="mt-1 text-xl font-black text-ink">{customer.display_name}</h3>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={!customer.zalo_user_id} onClick={() => onGrantVoucher(customer)}>
            <AiOutlineGift className="text-lg" />
            Cấp voucher
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-admin text-xl text-muted transition hover:bg-cream hover:text-ink"
            aria-label="Đóng hồ sơ khách hàng"
          >
            <AiOutlineClose />
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="space-y-4">
          <section className="rounded-admin border border-berry/10 bg-cream p-4">
            <h4 className="font-black text-ink">Thông tin</h4>
            <dl className="mt-4 space-y-3 text-sm">
              <InfoRow label="Định danh" value={getCustomerIdentifier(customer)} />
              <InfoRow label="SĐT" value={customer.phone || 'Chưa có'} />
              <InfoRow label="Địa chỉ gần nhất" value={customer.address || 'Chưa có'} />
              <InfoRow label="Hoạt động gần nhất" value={customer.last_activity_at ? formatDateTime(customer.last_activity_at) : 'Chưa có'} />
            </dl>
          </section>

          <section className="rounded-admin border border-berry/10 bg-white p-4">
            <h4 className="font-black text-ink">Tổng quan mua hàng</h4>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <InfoRow label="Đơn hàng" value={`${customer.order_count}`} strong />
              <InfoRow label="Hoàn thành" value={`${customer.completed_order_count}`} strong />
              <InfoRow label="Đặt riêng" value={`${customer.custom_request_count}`} strong />
              <InfoRow label="Chi tiêu" value={formatCurrency(customer.total_spent)} strong />
            </dl>
          </section>
        </aside>

        <section className="space-y-4">
          <section className="rounded-admin border border-berry/10 bg-white p-4">
            <h4 className="font-black text-ink">Voucher của khách</h4>
            <div className="mt-4 space-y-3">
              {customer.user_promotions.length ? (
                customer.user_promotions.map((userPromotion) => (
                  <div key={userPromotion.id} className="flex items-center justify-between gap-3 rounded-admin bg-cream p-3">
                    <div className="min-w-0">
                      <p className="truncate font-black text-ink">{getCustomerPromotionTitle(userPromotion)}</p>
                      <p className="mt-1 text-xs font-bold text-muted">
                        Cấp ngày {formatDateTime(userPromotion.claimed_at)}
                      </p>
                    </div>
                    <Badge tone={getCustomerVoucherStatusTone(userPromotion.status)}>
                      {customerVoucherStatusLabels[userPromotion.status]}
                    </Badge>
                  </div>
                ))
              ) : (
                <EmptyRow text="Khách chưa có voucher." />
              )}
            </div>
          </section>

          <section className="rounded-admin border border-berry/10 bg-white p-4">
            <h4 className="font-black text-ink">Đơn hàng gần đây</h4>
            <div className="mt-4 space-y-3">
              {customer.orders.length ? (
                customer.orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between gap-3 rounded-admin bg-cream p-3">
                    <div>
                      <p className="font-black text-ink">{formatCurrency(getOrderTotal(order))}</p>
                      <p className="mt-1 text-xs font-bold text-muted">{formatDateTime(order.created_at)}</p>
                    </div>
                    <Badge tone={order.status === 'done' ? 'success' : order.status === 'cancelled' ? 'danger' : 'info'}>
                      {orderStatusLabels[order.status]}
                    </Badge>
                  </div>
                ))
              ) : (
                <EmptyRow text="Khách chưa có đơn hàng." />
              )}
            </div>
          </section>

          <section className="rounded-admin border border-berry/10 bg-white p-4">
            <h4 className="font-black text-ink">Yêu cầu đặt riêng</h4>
            <div className="mt-4 space-y-3">
              {customer.custom_requests.length ? (
                customer.custom_requests.slice(0, 5).map((request) => (
                  <div key={request.id} className="rounded-admin bg-cream p-3">
                    <p className="line-clamp-2 font-bold text-cocoa">{request.description || 'Chưa nhập mô tả'}</p>
                    <p className="mt-1 text-xs font-bold text-muted">{formatDateTime(request.created_at)}</p>
                  </div>
                ))
              ) : (
                <EmptyRow text="Khách chưa có yêu cầu đặt riêng." />
              )}
            </div>
          </section>
        </section>
      </div>
    </div>
  </div>
)

const InfoRow = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => (
  <div>
    <dt className="text-xs font-bold uppercase text-muted">{label}</dt>
    <dd className={strong ? 'mt-1 text-lg font-black text-ink' : 'mt-1 font-bold text-cocoa'}>{value}</dd>
  </div>
)

const EmptyRow = ({ text }: { text: string }) => (
  <div className="rounded-admin border border-dashed border-berry/20 bg-cream px-4 py-8 text-center text-sm font-bold text-muted">
    {text}
  </div>
)
