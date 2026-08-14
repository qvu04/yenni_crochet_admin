import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { ActionNotice, Card, CardContent, CardDescription, CardHeader, CardTitle, getPaginatedItems, TablePagination } from '../../components/ui'
import { useBulkUpdateOrderStatusMutation, useOrdersQuery } from '../../queries'
import type { Order, OrderStatus, OrderStatusFilter } from '../../services'
import {
  editableOrderStatusOptions,
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
  count?: number
}

export const OrdersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = normalizeOrderStatus(searchParams.get('status'))
  const search = searchParams.get('q') ?? ''
  const [searchInput, setSearchInput] = useState(search)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>('confirmed')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [savedNotice, setSavedNotice] = useState<SavedOrderNotice | null>(null)
  const ordersQuery = useOrdersQuery({ search, status })
  const bulkUpdateMutation = useBulkUpdateOrderStatusMutation()

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

  useEffect(() => {
    setSelectedOrderIds((currentIds) => currentIds.filter((id) => ordersQuery.data?.some((order) => order.id === id)))
  }, [ordersQuery.data])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, status, pageSize])

  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data])
  const { items: paginatedOrders } = getPaginatedItems(orders, currentPage, pageSize)
  const selectedOrders = useMemo(
    () => orders.filter((order) => selectedOrderIds.includes(order.id)),
    [orders, selectedOrderIds],
  )
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

  const toggleSelectedOrder = (orderId: string) => {
    setSelectedOrderIds((currentIds) =>
      currentIds.includes(orderId)
        ? currentIds.filter((id) => id !== orderId)
        : [...currentIds, orderId],
    )
  }

  const toggleSelectedAllOrders = (pageOrders: Order[]) => {
    const pageOrderIds = pageOrders.map((order) => order.id)
    const isEveryPageOrderSelected = pageOrderIds.every((id) => selectedOrderIds.includes(id))

    setSelectedOrderIds((currentIds) =>
      isEveryPageOrderSelected
        ? currentIds.filter((id) => !pageOrderIds.includes(id))
        : Array.from(new Set([...currentIds, ...pageOrderIds])),
    )
  }

  const handleBulkUpdateStatus = () => {
    if (!selectedOrderIds.length || bulkUpdateMutation.isPending) return

    bulkUpdateMutation.mutate(
      { orderIds: selectedOrderIds, status: bulkStatus },
      {
        onSuccess: (savedOrders) => {
          const firstSavedOrder = savedOrders[0]
          setSavedNotice({
            id: firstSavedOrder?.id ?? selectedOrderIds[0],
            customerName: savedOrders.length === 1 ? firstSavedOrder?.customer_name ?? '1 đơn hàng' : `${savedOrders.length} đơn hàng`,
            statusLabel: editableOrderStatusOptions.find((option) => option.value === bulkStatus)?.label ?? 'Đã cập nhật',
            count: savedOrders.length,
          })
          setSelectedOrderIds([])
        },
      },
    )
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
          title={savedNotice.count && savedNotice.count > 1
            ? `Đã cập nhật ${savedNotice.count} đơn hàng`
            : `Đã cập nhật đơn hàng của “${savedNotice.customerName}”`}
          description={`Trạng thái mới: ${savedNotice.statusLabel}.`}
          primaryAction={{
            label: 'Xem trong danh sách',
            onClick: scrollToSavedOrder,
          }}
          onDismiss={() => setSavedNotice(null)}
        />
      ) : null}

      {selectedOrderIds.length ? (
        <Card className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black text-ink">Đang chọn {selectedOrderIds.length} đơn hàng</p>
              <p className="mt-1 text-xs font-bold text-muted">
                {selectedOrders.slice(0, 2).map((order) => order.customer_name).join(', ') || 'Chọn trạng thái mới để cập nhật hàng loạt.'}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={bulkStatus}
                onChange={(event) => setBulkStatus(event.target.value as OrderStatus)}
                className="admin-input min-w-64 bg-white"
              >
                {editableOrderStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleBulkUpdateStatus}
                disabled={bulkUpdateMutation.isPending}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-admin bg-ink px-4 text-sm font-black text-white transition hover:bg-cocoa disabled:pointer-events-none disabled:opacity-50"
              >
                {bulkUpdateMutation.isPending ? <AiOutlineLoading3Quarters className="animate-spin text-lg" /> : null}
                Cập nhật
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrderIds([])}
                className="inline-flex h-11 items-center justify-center rounded-admin bg-cream px-4 text-sm font-black text-cocoa transition hover:bg-blush/60"
              >
                Bỏ chọn
              </button>
            </div>
          </div>
          {bulkUpdateMutation.error ? (
            <p className="mt-3 rounded-admin bg-berry/10 px-3 py-2 text-sm font-bold text-berry">
              Không cập nhật được: {bulkUpdateMutation.error.message}
            </p>
          ) : null}
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex-col gap-4">
          <div>
            <CardTitle>Danh sách đơn hàng</CardTitle>
            <CardDescription>Lọc theo trạng thái và tìm nhanh theo tên, số điện thoại hoặc mã đơn hàng.</CardDescription>
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
            orders={paginatedOrders}
            isLoading={ordersQuery.isLoading}
            isError={ordersQuery.isError}
            highlightedOrderId={savedNotice?.id}
            selectedOrderIds={selectedOrderIds.filter((id) => paginatedOrders.some((order) => order.id === id))}
            onRetry={() => void ordersQuery.refetch()}
            onView={setSelectedOrder}
            onToggleSelect={toggleSelectedOrder}
            onToggleSelectAll={() => toggleSelectedAllOrders(paginatedOrders)}
          />
          <TablePagination
            totalItems={orders.length}
            currentPage={currentPage}
            pageSize={pageSize}
            itemLabel="đơn"
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
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
