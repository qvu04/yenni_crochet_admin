import type { ReactNode } from 'react'
import {
  AiOutlineGift,
  AiOutlineInbox,
  AiOutlineShoppingCart,
  AiOutlineWallet,
} from 'react-icons/ai'
import { Card, CardContent } from '../../../components/ui'
import { formatCurrency } from '../../../utils'

interface DashboardStatsProps {
  todayRevenue: number
  todayOrderCount: number
  pendingOrderCount: number
  pendingRequestCount: number
  totalInventoryQuantity: number
}

export const DashboardStats = ({
  todayRevenue,
  todayOrderCount,
  pendingOrderCount,
  pendingRequestCount,
  totalInventoryQuantity,
}: DashboardStatsProps) => (
  <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <StatCard
      label="Doanh thu hôm nay"
      value={formatCurrency(todayRevenue)}
      description={`${todayOrderCount} đơn không bị hủy`}
      icon={<AiOutlineWallet />}
    />
    <StatCard
      label="Đơn chờ xác nhận"
      value={String(pendingOrderCount)}
      description="Cần phản hồi sớm"
      icon={<AiOutlineShoppingCart />}
    />
    <StatCard
      label="Đặt riêng mới"
      value={String(pendingRequestCount)}
      description="Yêu cầu chưa liên hệ"
      icon={<AiOutlineInbox />}
    />
    <StatCard
      label="Tổng tồn kho"
      value={String(totalInventoryQuantity)}
      description="Số lượng sản phẩm còn bán"
      icon={<AiOutlineGift />}
    />
  </section>
)

const StatCard = ({
  label,
  value,
  description,
  icon,
}: {
  label: string
  value: string
  description: string
  icon: ReactNode
}) => (
  <Card>
    <CardContent>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold text-muted">{label}</p>
          <p className="mt-2 truncate text-2xl font-black text-ink">{value}</p>
        </div>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-admin bg-blush/80 text-2xl text-ink">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-sm text-muted">{description}</p>
    </CardContent>
  </Card>
)
