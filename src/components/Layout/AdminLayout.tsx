import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  AiOutlineCalendar,
  AiOutlineGift,
  AiOutlineInbox,
  AiOutlineLoading3Quarters,
  AiOutlinePieChart,
  AiOutlineShoppingCart,
  AiOutlineTag,
} from 'react-icons/ai'
import shopImg from '../../assets/shop.png'
import { useLogoutMutation } from '../../queries'
import { useAuth } from '../../providers'

const navigation = [
  { label: 'Tổng quan', href: '/', icon: <AiOutlinePieChart /> },
  { label: 'Đơn hàng', href: '/orders', icon: <AiOutlineShoppingCart /> },
  { label: 'Sản phẩm', href: '/products', icon: <AiOutlineGift /> },
  { label: 'Ưu đãi', href: '/vouchers', icon: <AiOutlineTag /> },
  { label: 'Campaign', href: '/campaigns', icon: <AiOutlineCalendar /> },
  { label: 'Đặt riêng', href: '/custom-requests', icon: <AiOutlineInbox /> },
] as const

export const AdminLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, adminProfile, isAdmin, isLoading } = useAuth()
  const logoutMutation = useLogoutMutation()

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        navigate('/login', { replace: true })
      },
    })
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream p-5 text-cocoa">
        <div className="flex items-center gap-3 rounded-admin bg-white px-5 py-4 text-sm font-bold shadow-soft ring-1 ring-berry/10">
          <AiOutlineLoading3Quarters className="animate-spin text-xl text-berry" />
          Đang kiểm tra quyền quản trị...
        </div>
      </main>
    )
  }

  if (!session) {
    return <Navigate to={`/login?redirectTo=${encodeURIComponent(location.pathname)}`} replace />
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream p-5">
        <section className="w-full max-w-md rounded-admin bg-white p-6 text-center shadow-soft ring-1 ring-berry/10">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Không có quyền</p>
          <h1 className="mt-2 text-2xl font-black text-ink">Tài khoản chưa được cấp quyền admin</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Hãy kiểm tra lại dòng tương ứng trong bảng admin_profiles hoặc bật is_active cho tài khoản này.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 h-11 rounded-admin bg-ink px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={logoutMutation.isPending}
          >
            Quay lại đăng nhập
          </button>
        </section>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-cream text-cocoa">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-berry/10 bg-white/85 px-5 py-6 shadow-soft backdrop-blur lg:block">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-admin bg-blush text-2xl text-ink">
            <img src={shopImg} alt="Logo Shop" className="h-full w-full object-contain border border-berry/10 rounded-full" />
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
              <p className="mt-1 text-sm font-bold text-ink">{adminProfile?.display_name}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="rounded-admin bg-ink px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {logoutMutation.isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
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
