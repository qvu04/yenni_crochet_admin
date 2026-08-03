import {
  AiOutlineAlert,
  AiOutlineInbox,
  AiOutlineShoppingCart,
  AiOutlineWallet,
} from 'react-icons/ai'
import { formatCurrency } from '../lib/format'

const stats = [
  {
    label: 'Doanh thu hôm nay',
    value: formatCurrency(1250000),
    description: 'Tạm tính từ đơn đã đặt',
    icon: <AiOutlineWallet />,
  },
  {
    label: 'Đơn mới',
    value: '8',
    description: 'Đang chờ xác nhận',
    icon: <AiOutlineShoppingCart />,
  },
  {
    label: 'Đặt riêng',
    value: '3',
    description: 'Yêu cầu cần phản hồi',
    icon: <AiOutlineInbox />,
  },
  {
    label: 'Sắp hết hàng',
    value: '5',
    description: 'Biến thể còn ít tồn kho',
    icon: <AiOutlineAlert />,
  },
] as const

const recentOrders = [
  { customer: 'Ngô Quang Vũ', items: 'Khăn len be hồng pastel x 21', total: 252000, status: 'Chờ xác nhận' },
  { customer: 'User Name', items: 'Móc khóa gấu mini x 2', total: 58000, status: 'Đã xác nhận' },
  { customer: 'Lan', items: 'Gấu bông móc len mini x 1', total: 89000, status: 'Đang chuẩn bị' },
] as const

export const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-black text-ink">Tổng quan hôm nay</h2>
        <p className="mt-1 text-sm text-muted">
          Sau này các số liệu này sẽ đọc trực tiếp từ Supabase và realtime khi có đơn mới.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-admin bg-white p-5 shadow-soft ring-1 ring-berry/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-muted">{stat.label}</p>
                <p className="mt-2 text-2xl font-black text-ink">{stat.value}</p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-admin bg-blush/80 text-2xl text-ink">
                {stat.icon}
              </span>
            </div>
            <p className="mt-3 text-sm text-muted">{stat.description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <article className="rounded-admin bg-white p-5 shadow-soft ring-1 ring-berry/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-ink">Đơn hàng mới nhất</h3>
              <p className="mt-1 text-sm text-muted">Danh sách nhanh để vợ bạn xử lý đơn ngay.</p>
            </div>
            <button className="rounded-admin bg-blush px-4 py-2 text-sm font-bold text-ink">
              Xem tất cả
            </button>
          </div>

          <div className="mt-5 overflow-hidden rounded-admin border border-berry/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream text-xs uppercase tracking-[0.08em] text-muted">
                <tr>
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3">Sản phẩm</th>
                  <th className="px-4 py-3">Tổng</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-berry/10">
                {recentOrders.map((order) => (
                  <tr key={`${order.customer}-${order.items}`}>
                    <td className="px-4 py-4 font-bold text-ink">{order.customer}</td>
                    <td className="px-4 py-4 text-muted">{order.items}</td>
                    <td className="px-4 py-4 font-bold text-ink">{formatCurrency(order.total)}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-ink">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-admin bg-ink p-5 text-white shadow-soft">
          <p className="text-sm font-bold text-white/65">Realtime sau này</p>
          <h3 className="mt-2 text-xl font-black">Có đơn mới là báo ngay</h3>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Admin web sẽ subscribe Supabase Realtime vào bảng orders và custom_requests để hiện toast,
            badge và âm báo nhẹ khi khách đặt hàng.
          </p>
        </article>
      </section>
    </div>
  )
}
