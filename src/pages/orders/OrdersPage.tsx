import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ActionNotice, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui'
import { useOrdersQuery } from '../../queries'
import type { Order, OrderStatusFilter } from '../../services'
import {
  formatCurrency,
  getOrderStatusLabel,
  getOrderTotal,
  isAwaitingConfirmationOrder,
  isCancelledOrder,
  normalizeOrderStatus,
} from '../../utils'
import { OrderDetailDialog, OrderFilters, OrderMetric, OrdersTable } from './components'

const SAVE_FEEDBACK_DURATION_MS = 4500

interface SavedOrderNotice {
  id: string
  customerName: string
  statusLabel: string
}

export const OrdersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = normalizeOrderStatus(searchParams.get('status'))
  const search = searchParams.get('q') ?? ''
  const [searchInput, setSearchInput] = useState(search)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [savedNotice, setSavedNotice] = useState<SavedOrderNotice | null>(null)
  const ordersQuery = useOrdersQuery({ search, status })

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    if (!savedNotice) return

    const timeoutId = window.setTimeout(() => {
      setSavedNotice(null)
    }, SAVE_FEEDBACK_DURATION_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [savedNotice])

  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data])
  const awaitingConfirmationOrders = useMemo(() => orders.filter(isAwaitingConfirmationOrder), [orders])
  const inProgressOrders = useMemo(
    () => orders.filter((order) => order.status === 'confirmed' || order.status === 'making' || order.status === 'shipping'),
    [orders],
  )
  const totalRevenue = useMemo(
    () => orders.filter((order) => !isCancelledOrder(order)).reduce((total, order) => total + getOrderTotal(order), 0),
    [orders],
  )

  const updateFilters = (nextValues: { q?: string; status?: OrderStatusFilter }) => {
    const nextParams = new URLSearchParams(searchParams)
    const nextSearch = nextValues.q ?? search
    const nextStatus = nextValues.status ?? status

    if (nextSearch.trim()) {
      nextParams.set('q', nextSearch.trim())
    } else {
      nextParams.delete('q')
    }

    if (nextStatus !== 'all') {
      nextParams.set('status', nextStatus)
    } else {
      nextParams.delete('status')
    }

    setSearchParams(nextParams)
  }

  const handleOrderSaved = (order: Order) => {
    setSavedNotice({
      id: order.id,
      customerName: order.customer_name,
      statusLabel: getOrderStatusLabel(order),
    })
  }

  const scrollToSavedOrder = () => {
    if (!savedNotice) return

    document
      .querySelector(`[data-order-row-id="${savedNotice.id}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Đơn hàng</p>
        <h2 className="mt-2 text-3xl font-black text-ink">Quản lý đơn hàng</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Theo dõi đơn mới, xem chi tiết sản phẩm khách đặt và cập nhật trạng thái xử lý.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <OrderMetric label="Tổng đơn" value={orders.length} />
        <OrderMetric label="Chờ xác nhận" value={awaitingConfirmationOrders.length} />
        <OrderMetric label="Đang xử lý" value={inProgressOrders.length} />
        <OrderMetric label="Tổng giá trị" value={formatCurrency(totalRevenue)} />
      </section>

      {savedNotice ? (
        <ActionNotice
          tone="success"
          title={`Đã cập nhật đơn hàng của “${savedNotice.customerName}”`}
          description={`Trạng thái mới: ${savedNotice.statusLabel}.`}
          primaryAction={{
            label: 'Xem trong danh sách',
            onClick: scrollToSavedOrder,
          }}
          onDismiss={() => setSavedNotice(null)}
        />
      ) : null}

      <Card>
        <CardHeader className="flex-col gap-4 xl:flex-row">
          <div>
            <CardTitle>Danh sách đơn hàng</CardTitle>
            <CardDescription>Lọc theo trạng thái và tìm nhanh theo tên hoặc số điện thoại khách hàng.</CardDescription>
          </div>
          <OrderFilters
            searchInput={searchInput}
            status={status}
            onSearchInputChange={setSearchInput}
            onSubmitSearch={() => updateFilters({ q: searchInput })}
            onStatusChange={(value) => updateFilters({ status: value })}
          />
        </CardHeader>
        <CardContent>
          <OrdersTable
            orders={orders}
            isLoading={ordersQuery.isLoading}
            isError={ordersQuery.isError}
            highlightedOrderId={savedNotice?.id}
            onRetry={() => void ordersQuery.refetch()}
            onView={setSelectedOrder}
          />
        </CardContent>
      </Card>

      {selectedOrder ? (
        <OrderDetailDialog
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSaved={handleOrderSaved}
        />
      ) : null}
    </div>
  )
}
