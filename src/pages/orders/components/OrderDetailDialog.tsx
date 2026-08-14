import { useState } from 'react'
import { AiOutlineClose, AiOutlineEnvironment, AiOutlineLoading3Quarters } from 'react-icons/ai'
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
  getShortOrderCode,
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
  const deliveryLocation =
    order.delivery_latitude != null && order.delivery_longitude != null
      ? {
        latitude: Number(order.delivery_latitude),
        longitude: Number(order.delivery_longitude),
      }
      : null
  const mapsQuery = deliveryLocation ? `${deliveryLocation.latitude},${deliveryLocation.longitude}` : ''
  const googleMapsUrl = deliveryLocation
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`
    : ''
  const googleDirectionsUrl = deliveryLocation
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapsQuery)}`
    : ''
  const mapEmbedUrl = deliveryLocation
    ? `https://maps.google.com/maps?q=${encodeURIComponent(mapsQuery)}&z=16&output=embed`
    : ''

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
      <div className="mx-auto max-w-6xl rounded-admin bg-white shadow-soft ring-1 ring-berry/10">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-t-admin border-b border-berry/10 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Chi tiết đơn hàng</p>
            <h3 className="mt-1 text-xl font-black text-ink">
              #{getShortOrderCode(order.id)} · {order.customer_name}
            </h3>
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

        <div className="space-y-5 p-5">
          <section className="rounded-admin border border-berry/10 bg-cream p-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr] lg:items-end">
              <div>
                <p className="text-sm font-bold text-muted">Trạng thái hiện tại</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <Badge tone={getOrderStatusTone(order)}>{getOrderStatusLabel(order)}</Badge>
                  <span className="text-sm font-bold text-muted">{formatDateTime(order.created_at)}</span>
                </div>
              </div>

              <div>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <select
                    value={nextStatus}
                    onChange={(event) => setNextStatus(event.target.value as OrderStatus)}
                    className="admin-input bg-white"
                  >
                    {editableOrderStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <Button disabled={!canSave || updateStatusMutation.isPending} onClick={handleSaveStatus}>
                    {updateStatusMutation.isPending ? <AiOutlineLoading3Quarters className="animate-spin text-lg" /> : null}
                    Lưu trạng thái
                  </Button>
                </div>
                {updateStatusMutation.error ? (
                  <div className="mt-3">
                    <ActionNotice
                      tone="danger"
                      title="Không cập nhật được trạng thái"
                      description={updateStatusMutation.error.message}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-admin border border-berry/10 bg-white p-4">
              <h4 className="font-black text-ink">Thông tin khách</h4>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <InfoRow label="Mã đơn" value={`#${getShortOrderCode(order.id)}`} />
                <InfoRow label="Tên" value={order.customer_name} />
                <InfoRow label="SĐT" value={order.phone} />
                <InfoRow label="Địa chỉ" value={order.address} />
                <InfoRow label="Ghi chú" value={order.note || 'Không có'} />
              </dl>
            </section>

            <section className="rounded-admin border border-berry/10 bg-white p-4">
              <h4 className="font-black text-ink">Thanh toán</h4>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
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
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
            <section className="rounded-admin border border-berry/10 bg-white p-4">
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
            </section>

            <section className="rounded-admin border border-berry/10 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-black text-ink">Vị trí giao hàng</h4>
                  <p className="mt-1 text-xs font-bold text-muted">
                    {deliveryLocation ? 'Lấy từ vị trí khách chia sẻ trong Zalo Mini App.' : 'Khách chưa chia sẻ tọa độ giao hàng.'}
                  </p>
                </div>
                <AiOutlineEnvironment className="text-2xl text-berry" />
              </div>

              {deliveryLocation ? (
                <div className="mt-4 space-y-3">
                  <div className="overflow-hidden rounded-admin bg-cream ring-1 ring-berry/10">
                    <iframe
                      title="Bản đồ vị trí giao hàng"
                      src={mapEmbedUrl}
                      className="h-72 w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <InfoRow label="Tọa độ" value={`${deliveryLocation.latitude}, ${deliveryLocation.longitude}`} />
                    <InfoRow
                      label="Độ chính xác"
                      value={order.delivery_location_accuracy != null ? `${order.delivery_location_accuracy}m` : 'Chưa rõ'}
                    />
                  </dl>
                  <div className="flex flex-wrap gap-2">
                    <MapLink href={googleMapsUrl}>Mở Google Maps</MapLink>
                    <MapLink href={googleDirectionsUrl}>Chỉ đường</MapLink>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-admin border border-dashed border-berry/20 bg-cream px-4 py-6 text-center text-sm font-bold text-muted">
                  Admin vẫn có thể dùng địa chỉ khách nhập thủ công ở phía trên.
                </div>
              )}
            </section>
          </section>
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

const MapLink = ({ href, children }: { href: string; children: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="inline-flex h-10 items-center justify-center rounded-admin bg-blush px-3 text-sm font-black text-ink transition hover:bg-blush/80"
  >
    {children}
  </a>
)
