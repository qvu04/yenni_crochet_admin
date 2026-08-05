import { useState } from 'react'
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  AiOutlineCalendar,
  AiOutlineBell,
  AiOutlineCheck,
  AiOutlineClose,
  AiOutlineGift,
  AiOutlineInbox,
  AiOutlineLoading3Quarters,
  AiOutlinePieChart,
  AiOutlineShoppingCart,
  AiOutlineTag,
  AiOutlineTeam,
} from 'react-icons/ai'
import shopImg from '../../assets/shop.png'
import { useLogoutMutation } from '../../queries'
import { useAuth } from '../../providers'
import { useAdminRealtimeNotifications } from '../../hooks/useAdminRealtimeNotifications'
import { formatDateTime } from '../../utils'

const navigation = [
  { label: 'Tổng quan', href: '/', icon: <AiOutlinePieChart /> },
  { label: 'Đơn hàng', href: '/orders', icon: <AiOutlineShoppingCart /> },
  { label: 'Sản phẩm', href: '/products', icon: <AiOutlineGift /> },
  { label: 'Khách hàng', href: '/customers', icon: <AiOutlineTeam /> },
  { label: 'Ưu đãi', href: '/vouchers', icon: <AiOutlineTag /> },
  { label: 'Campaign', href: '/campaigns', icon: <AiOutlineCalendar /> },
  { label: 'Đặt riêng', href: '/custom-requests', icon: <AiOutlineInbox /> },
] as const

export const AdminLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, adminProfile, isAdmin, isLoading } = useAuth()
  const logoutMutation = useLogoutMutation()
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const {
    notifications,
    unreadCount,
    connectionStatus,
    markAllAsRead,
    clearNotifications,
  } = useAdminRealtimeNotifications(Boolean(session && isAdmin))

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
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotificationOpen((currentValue) => !currentValue)
                    markAllAsRead()
                  }}
                  className="relative flex h-10 w-10 items-center justify-center rounded-admin bg-white text-xl text-ink shadow-sm ring-1 ring-berry/10 transition hover:bg-blush"
                  aria-label="Thông báo realtime"
                >
                  <AiOutlineBell />
                  {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-berry px-1 text-[10px] font-black text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  ) : null}
                </button>

                {isNotificationOpen ? (
                  <section className="absolute right-0 mt-3 w-[min(360px,calc(100vw-40px))] overflow-hidden rounded-admin bg-white shadow-soft ring-1 ring-berry/10">
                    <div className="flex items-start justify-between gap-3 border-b border-berry/10 px-4 py-3">
                      <div>
                        <p className="text-sm font-black text-ink">Thông báo mới</p>
                        <p className="mt-1 text-xs font-bold text-muted">
                          {connectionStatus === 'connected'
                            ? 'Đang lắng nghe đơn hàng realtime'
                            : connectionStatus === 'error'
                              ? 'Realtime chưa kết nối'
                              : 'Đang khởi tạo realtime'}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={clearNotifications}
                          className="flex h-8 w-8 items-center justify-center rounded-admin text-muted transition hover:bg-cream hover:text-ink"
                          aria-label="Xóa thông báo"
                        >
                          <AiOutlineCheck />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsNotificationOpen(false)}
                          className="flex h-8 w-8 items-center justify-center rounded-admin text-muted transition hover:bg-cream hover:text-ink"
                          aria-label="Đóng thông báo"
                        >
                          <AiOutlineClose />
                        </button>
                      </div>
                    </div>

                    {notifications.length ? (
                      <div className="max-h-96 overflow-y-auto p-2">
                        {notifications.map((notification) => (
                          <Link
                            key={notification.id}
                            to={notification.href}
                            onClick={() => setIsNotificationOpen(false)}
                            className="block rounded-admin px-3 py-3 transition hover:bg-cream"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-black text-ink">{notification.title}</p>
                                <p className="mt-1 truncate text-sm font-bold text-cocoa">{notification.description}</p>
                                <p className="mt-1 text-xs font-bold text-muted">{formatDateTime(notification.createdAt)}</p>
                              </div>
                              <span className="mt-1 rounded-full bg-blush px-2 py-1 text-[10px] font-black uppercase text-ink">
                                {notification.type === 'order' ? 'Đơn' : 'Đặt riêng'}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-center text-sm font-bold text-muted">
                        Chưa có thông báo mới trong phiên này.
                      </div>
                    )}
                  </section>
                ) : null}
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
          </div>
        </header>

        <main className="px-5 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
