import { useState } from 'react'
import { AiOutlineClose, AiOutlineLoading3Quarters } from 'react-icons/ai'
import { ActionNotice, Badge, Button } from '../../../components/ui'
import { useUpdateOrderStatusMutation } from '../../../queries'
import type { Order, OrderStatus } from '../../../services'
import {
  editableOrderStatusOptions,
  formatCurrency,
  formatDateTime,
  getOrderDepositAmount,
  getOrderItemProduct,
  getOrderRemainingAmount,
  getOrderStatusLabel,
  getOrderStatusTone,
  getOrderTotal,
  paymentStatusLabels,
  paymentTypeLabels,
} from '../../../utils'

interface OrderDetailDialogProps {
  order: Order
  onClose: () => void
  onSaved: (order: Order) => void
}

export const OrderDetailDialog = ({ order, onClose, onSaved }: OrderDetailDialogProps) => {
  const [nextStatus, setNextStatus] = useState<OrderStatus>(order.status)
  const updateStatusMutation = useUpdateOrderStatusMutation()
  const items = order.order_items ?? []
  const canSave = nextStatus !== order.status

  const handleSaveStatus = () => {
    updateStatusMutation.mutate(
      { orderId: order.id, status: nextStatus },
      {
        onSuccess: (savedOrder) => {
          onSaved(savedOrder)
          onClose()
        },
      },
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/20 px-4 py-6 backdrop-blur-[2px]">
      <div className="mx-auto max-w-4xl rounded-admin bg-white shadow-soft ring-1 ring-berry/10">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-t-admin border-b border-berry/10 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Chi tiết đơn hàng</p>
            <h3 className="mt-1 text-xl font-black text-ink">{order.customer_name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-admin text-xl text-muted transition hover:bg-cream hover:text-ink"
            aria-label="Đóng chi tiết đơn"
          >
            <AiOutlineClose />
          </button>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_0.78fr]">
          <section className="space-y-4">
            <div className="rounded-admin border border-berry/10 bg-cream p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-muted">Trạng thái hiện tại</p>
                  <div className="mt-2">
                    <Badge tone={getOrderStatusTone(order)}>{getOrderStatusLabel(order)}</Badge>
                  </div>
                </div>
                <p className="text-sm font-bold text-muted">{formatDateTime(order.created_at)}</p>
              </div>
            </div>

            <div className="rounded-admin border border-berry/10 bg-white p-4">
              <h4 className="font-black text-ink">Sản phẩm trong đơn</h4>
              <div className="mt-4 space-y-3">
                {items.length ? (
                  items.map((item) => {
                    const product = getOrderItemProduct(item)
                    const imageUrl = item.variant_image || product?.images?.[0]

                    return (
                      <div key={item.id} className="flex gap-3 rounded-admin bg-cream p-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-admin bg-white ring-1 ring-berry/10">
                          {imageUrl ? <img src={imageUrl} alt={product?.name ?? 'Sản phẩm'} className="h-full w-full object-cover" /> : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-black text-ink">{product?.name ?? 'Sản phẩm'}</p>
                          <p className="mt-1 text-xs font-bold text-muted">
                            {item.variant_color_name || item.variant_name || 'Không phân loại'} · x {item.quantity}
                          </p>
                          {item.note ? <p className="mt-2 text-sm text-muted">{item.note}</p> : null}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-ink">{formatCurrency(item.total_price)}</p>
                          <p className="mt-1 text-xs font-bold text-muted">{formatCurrency(item.unit_price)}/sp</p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="rounded-admin border border-dashed border-berry/20 bg-cream px-4 py-8 text-center text-sm font-bold text-muted">
                    Chưa có dòng sản phẩm chi tiết.
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-admin border border-berry/10 bg-white p-4">
              <h4 className="font-black text-ink">Thông tin khách</h4>
              <dl className="mt-4 space-y-3 text-sm">
                <InfoRow label="Tên" value={order.customer_name} />
                <InfoRow label="SĐT" value={order.phone} />
                <InfoRow label="Địa chỉ" value={order.address} />
                <InfoRow label="Ghi chú" value={order.note || 'Không có'} />
              </dl>
            </section>

            <section className="rounded-admin border border-berry/10 bg-white p-4">
              <h4 className="font-black text-ink">Thanh toán</h4>
              <dl className="mt-4 space-y-3 text-sm">
                <InfoRow label="Tạm tính" value={formatCurrency(Number(order.subtotal_price ?? getOrderTotal(order)))} />
                <InfoRow label="Giảm giá" value={formatCurrency(Number(order.discount_amount ?? 0))} />
                <InfoRow label="Hình thức" value={order.payment_type ? paymentTypeLabels[order.payment_type] : 'Chưa rõ'} />
                <InfoRow label="Trạng thái" value={order.payment_status ? paymentStatusLabels[order.payment_status] : 'Chưa rõ'} />
                <InfoRow label="Đã cọc" value={formatCurrency(getOrderDepositAmount(order))} />
                <InfoRow label="Còn lại" value={formatCurrency(getOrderRemainingAmount(order))} />
                {order.paid_at ? <InfoRow label="Ngày thanh toán" value={formatDateTime(order.paid_at)} /> : null}
                <InfoRow label="Tổng cộng" value={formatCurrency(getOrderTotal(order))} strong />
              </dl>
            </section>

            <section className="rounded-admin border border-berry/10 bg-white p-4">
              <h4 className="font-black text-ink">Cập nhật trạng thái</h4>
              <select
                value={nextStatus}
                onChange={(event) => setNextStatus(event.target.value as OrderStatus)}
                className="admin-input mt-4"
              >
                {editableOrderStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {updateStatusMutation.error ? (
                <ActionNotice
                  tone="danger"
                  title="Không cập nhật được trạng thái"
                  description={updateStatusMutation.error.message}
                />
              ) : null}
              <Button className="mt-4 w-full" disabled={!canSave || updateStatusMutation.isPending} onClick={handleSaveStatus}>
                {updateStatusMutation.isPending ? <AiOutlineLoading3Quarters className="animate-spin text-lg" /> : null}
                Lưu trạng thái
              </Button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}

const InfoRow = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => (
  <div>
    <dt className="text-xs font-bold uppercase text-muted">{label}</dt>
    <dd className={strong ? 'mt-1 text-lg font-black text-ink' : 'mt-1 font-bold text-cocoa'}>{value}</dd>
  </div>
)
