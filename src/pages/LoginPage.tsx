export const LoginPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream p-5">
      <section className="w-full max-w-md rounded-admin bg-white p-6 shadow-soft ring-1 ring-berry/10">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Yenni Crochet Admin</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Đăng nhập quản trị</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Form auth sẽ được nối với Supabase Auth ở bước tiếp theo.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-cocoa">Email</span>
            <input
              className="mt-2 h-12 w-full rounded-admin border border-berry/15 bg-cream px-4 outline-none focus:border-berry"
              placeholder="admin@yennicrochet.com"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-cocoa">Mật khẩu</span>
            <input
              type="password"
              className="mt-2 h-12 w-full rounded-admin border border-berry/15 bg-cream px-4 outline-none focus:border-berry"
              placeholder="••••••••"
            />
          </label>
          <button className="h-12 w-full rounded-admin bg-blush text-sm font-black text-ink">
            Đăng nhập
          </button>
        </div>
      </section>
    </main>
  )
}
