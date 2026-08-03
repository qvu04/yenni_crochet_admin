import { NavLink, Outlet } from 'react-router-dom'
import {
  AiOutlineAppstore,
  AiOutlineGift,
  AiOutlineInbox,
  AiOutlinePieChart,
  AiOutlineShoppingCart,
} from 'react-icons/ai'

const navigation = [
  { label: 'Tổng quan', href: '/', icon: <AiOutlinePieChart /> },
  { label: 'Đơn hàng', href: '/orders', icon: <AiOutlineShoppingCart /> },
  { label: 'Sản phẩm', href: '/products', icon: <AiOutlineGift /> },
  { label: 'Đặt riêng', href: '/custom-requests', icon: <AiOutlineInbox /> },
] as const

export const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-cream text-cocoa">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-berry/10 bg-white/85 px-5 py-6 shadow-soft backdrop-blur lg:block">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-admin bg-blush text-2xl text-ink">
            <AiOutlineAppstore />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Admin</p>
            <h1 className="text-xl font-black text-ink">Yenni Crochet</h1>
          </div>
        </div>

        <nav className="mt-8 grid gap-2">
          {navigation.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-admin px-4 py-3 text-sm font-bold transition',
                  isActive
                    ? 'bg-blush text-ink shadow-sm'
                    : 'text-muted hover:bg-cream hover:text-cocoa',
                ].join(' ')
              }
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-berry/10 bg-cream/85 px-5 py-4 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Trang quản trị</p>
              <p className="mt-1 text-lg font-black text-ink">Quản lý shop handmade dễ như dùng app</p>
            </div>
            <button className="rounded-admin bg-ink px-4 py-2 text-sm font-bold text-white">
              Đăng xuất
            </button>
          </div>
        </header>

        <main className="px-5 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
