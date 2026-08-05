import { useMemo, useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { Button, Card } from '../../components/ui'
import { useDashboardQuery } from '../../queries'
import {
  buildRevenueSeries,
  getOrderRevenue,
  getProductInventoryQuantity,
  getTodayOrders,
  statusTone,
  type RevenuePeriod,
  wait,
} from '../../utils'
import {
  DashboardStats,
  DashboardWorkItems,
  GlobalRefreshOverlay,
  RecentActivitySection,
  RevenueInventorySection,
} from './components'

const REFRESH_DELAY_MS = 850

export const DashboardPage = () => {
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>('day')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const dashboardQuery = useDashboardQuery()

  const handleRefresh = async () => {
    setIsRefreshing(true)

    try {
      await Promise.all([dashboardQuery.refetch(), wait(REFRESH_DELAY_MS)])
    } finally {
      setIsRefreshing(false)
    }
  }

  const summary = useMemo(() => {
    const orders = dashboardQuery.data?.orders ?? []
    const customRequests = dashboardQuery.data?.customRequests ?? []
    const products = dashboardQuery.data?.products ?? []
    const todayOrders = getTodayOrders(orders).filter((order) => statusTone(order.status) !== 'danger')
    const revenueSeries = buildRevenueSeries(orders, revenuePeriod)
    const activeProducts = products.filter((product) => product.is_active)
    const totalInventoryQuantity = activeProducts.reduce(
      (total, product) => total + getProductInventoryQuantity(product),
      0,
    )

    return {
      revenueSeries,
      recentOrders: orders.slice(0, 5),
      recentRequests: customRequests.slice(0, 5),
      todayRevenue: todayOrders.reduce((total, order) => total + getOrderRevenue(order), 0),
      todayOrderCount: todayOrders.length,
      pendingOrderCount: orders.filter((order) => order.status === 'pending').length,
      pendingRequestCount: customRequests.filter((request) => request.status === 'pending').length,
      activeProductCount: activeProducts.length,
      preOrderCount: activeProducts.filter((product) => product.is_pre_order || product.product_type === 'pre_order').length,
      totalInventoryQuantity,
      variantProductCount: activeProducts.filter((product) => product.product_variants?.some((variant) => variant.is_active)).length,
      chartTotal: revenueSeries.reduce((total, point) => total + point.value, 0),
    }
  }, [dashboardQuery.data, revenuePeriod])

  if (dashboardQuery.isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] items-center justify-center">
        <div className="flex items-center gap-3 rounded-admin bg-white px-5 py-4 text-sm font-bold text-cocoa shadow-soft ring-1 ring-berry/10">
          <AiOutlineLoading3Quarters className="animate-spin text-xl text-berry" />
          Đang tải tổng quan shop...
        </div>
      </div>
    )
  }

  if (dashboardQuery.isError) {
    return (
      <Card className="p-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Không tải được dữ liệu</p>
        <h2 className="mt-2 text-2xl font-black text-ink">Dashboard chưa đọc được Supabase</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Kiểm tra lại RLS admin, biến môi trường Supabase hoặc quyền của tài khoản đang đăng nhập.
        </p>
        <Button className="mt-5" onClick={() => void dashboardQuery.refetch()}>
          Tải lại
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {isRefreshing ? <GlobalRefreshOverlay /> : null}

      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Yenni Crochet</p>
          <h2 className="mt-2 text-3xl font-black text-ink">Tổng quan vận hành</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Số liệu lấy trực tiếp từ Supabase để theo dõi đơn hàng, doanh thu, yêu cầu đặt riêng và tồn kho.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void handleRefresh()} disabled={isRefreshing}>
            {isRefreshing ? <AiOutlineLoading3Quarters className="animate-spin text-lg" /> : null}
            {isRefreshing ? 'Đang làm mới...' : 'Làm mới'}
          </Button>
        </div>
      </section>

      <DashboardStats
        todayRevenue={summary.todayRevenue}
        todayOrderCount={summary.todayOrderCount}
        pendingOrderCount={summary.pendingOrderCount}
        pendingRequestCount={summary.pendingRequestCount}
        totalInventoryQuantity={summary.totalInventoryQuantity}
      />

      <DashboardWorkItems
        pendingOrderCount={summary.pendingOrderCount}
        pendingRequestCount={summary.pendingRequestCount}
        preOrderCount={summary.preOrderCount}
        activeProductCount={summary.activeProductCount}
      />

      <RevenueInventorySection
        revenuePeriod={revenuePeriod}
        revenueSeries={summary.revenueSeries}
        chartTotal={summary.chartTotal}
        totalInventoryQuantity={summary.totalInventoryQuantity}
        activeProductCount={summary.activeProductCount}
        variantProductCount={summary.variantProductCount}
        preOrderCount={summary.preOrderCount}
        onRevenuePeriodChange={setRevenuePeriod}
      />

      <RecentActivitySection
        recentOrders={summary.recentOrders}
        recentRequests={summary.recentRequests}
      />
    </div>
  )
}
