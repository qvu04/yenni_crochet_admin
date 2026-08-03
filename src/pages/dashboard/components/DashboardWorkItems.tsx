import { AiOutlineArrowRight } from 'react-icons/ai'
import { Link } from 'react-router-dom'
import { Card } from '../../../components/ui'

interface DashboardWorkItemsProps {
  pendingOrderCount: number
  pendingRequestCount: number
  preOrderCount: number
  activeProductCount: number
}

export const DashboardWorkItems = ({
  pendingOrderCount,
  pendingRequestCount,
  preOrderCount,
  activeProductCount,
}: DashboardWorkItemsProps) => (
  <section className="grid gap-4 md:grid-cols-3">
    <WorkItemCard
      title="Đơn cần xử lý"
      count={pendingOrderCount}
      description="Đơn đang ở trạng thái chờ xác nhận"
      href="/orders"
    />
    <WorkItemCard
      title="Đặt riêng cần gọi"
      count={pendingRequestCount}
      description="Khách đã gửi yêu cầu tư vấn"
      href="/custom-requests"
    />
    <WorkItemCard
      title="Sản phẩm preorder"
      count={preOrderCount}
      description={`${activeProductCount} sản phẩm đang bật bán`}
      href="/products"
    />
  </section>
)

const WorkItemCard = ({
  title,
  count,
  description,
  href,
}: {
  title: string
  count: number
  description: string
  href: string
}) => (
  <Card className="transition hover:-translate-y-0.5 hover:ring-berry/25">
    <Link to={href} className="block p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-ink">{title}</p>
          <p className="mt-2 text-3xl font-black text-berry">{count}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        </div>
        <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-cream text-lg text-berry">
          <AiOutlineArrowRight />
        </span>
      </div>
    </Link>
  </Card>
)
