import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { AiOutlineLoading3Quarters, AiOutlineLogin } from 'react-icons/ai'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useLoginMutation } from '../../queries'
import { loginSchema, type LoginFormValues } from '../../schemas'
import { useAuth } from '../../providers'
import { accountPreferenceServices } from '../../services'

export const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAdmin, isLoading } = useAuth()
  const loginMutation = useLoginMutation()
  const rememberedEmail = accountPreferenceServices.getRememberedAdminEmail()
  const redirectTo = new URLSearchParams(location.search).get('redirectTo') || '/'
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: rememberedEmail,
      password: '',
      rememberEmail: Boolean(rememberedEmail),
    },
  })

  useEffect(() => {
    setFocus(rememberedEmail ? 'password' : 'email')
  }, [rememberedEmail, setFocus])

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        navigate(redirectTo, { replace: true })
      },
    })
  }

  if (!isLoading && isAdmin) {
    return <Navigate to={redirectTo} replace />
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream p-5">
      <section className="w-full max-w-md rounded-admin bg-white p-6 shadow-soft ring-1 ring-berry/10">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted text-center">Yenni Crochet Admin</p>
        <h1 className="mt-2 text-3xl font-black text-ink text-center">Đăng nhập</h1>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="block">
            <span className="text-sm font-bold text-cocoa">Email</span>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              className="mt-2 h-12 w-full rounded-admin border border-berry/15 bg-cream px-4 outline-none focus:border-berry"
              placeholder="Nhập email..."
            />
            {errors.email ? (
              <span className="mt-2 block text-sm font-bold text-berry">{errors.email.message}</span>
            ) : null}
          </label>
          <label className="block">
            <span className="text-sm font-bold text-cocoa">Mật khẩu</span>
            <input
              {...register('password')}
              type="password"
              autoComplete="current-password"
              className="mt-2 h-12 w-full rounded-admin border border-berry/15 bg-cream px-4 outline-none focus:border-berry"
              placeholder="Nhập mật khẩu..."
            />
            {errors.password ? (
              <span className="mt-2 block text-sm font-bold text-berry">{errors.password.message}</span>
            ) : null}
          </label>

          <label className="flex items-center gap-3 rounded-admin border border-berry/10 bg-cream px-4 py-3 text-sm font-bold text-cocoa">
            <input
              {...register('rememberEmail')}
              type="checkbox"
              className="h-4 w-4 accent-berry"
            />
            Ghi nhớ email trên máy này
          </label>

          {loginMutation.error ? (
            <div className="rounded-admin border border-berry/20 bg-berry/10 px-4 py-3 text-sm font-bold text-berry">
              {loginMutation.error.message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-admin bg-blush text-sm font-black text-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loginMutation.isPending ? (
              <AiOutlineLoading3Quarters className="animate-spin text-xl" />
            ) : (
              <AiOutlineLogin className="text-xl" />
            )}
            {loginMutation.isPending ? 'Đang kiểm tra...' : 'Đăng nhập'}
          </button>
        </form>
      </section>
    </main>
  )
}
