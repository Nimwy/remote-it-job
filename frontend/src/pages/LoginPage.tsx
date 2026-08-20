import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useLogin } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

type FormData = z.infer<typeof schema>

export function LoginPage() {
  const login = useLogin()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      await login.mutateAsync(data)
      navigate('/hr')
    } catch {
      /* handled by error state below */
    }
  }

  return (
    <div className="mx-auto max-w-[480px] px-6 py-12">
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-card">
        <h1 className="mb-6 font-display text-headline-md">Đăng nhập HR</h1>

        <a
          href="/api/auth/google/login"
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest py-2.5 text-label-md text-on-surface hover:bg-surface-container"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Đăng nhập với Google
        </a>

        <div className="mb-4 flex items-center gap-3 text-body-sm text-secondary">
          <div className="h-px flex-1 bg-outline-variant" />
          Hoặc bằng Email
          <div className="h-px flex-1 bg-outline-variant" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-label-sm text-secondary">Email</label>
            <input
              type="email"
              {...register('email')}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-md focus:border-primary focus:outline-none"
            />
            {errors.email && <p className="mt-1 text-body-sm text-error">{errors.email.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-label-sm text-secondary">Mật khẩu</label>
            <input
              type="password"
              {...register('password')}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-md focus:border-primary focus:outline-none"
            />
            {errors.password && (
              <p className="mt-1 text-body-sm text-error">{errors.password.message}</p>
            )}
          </div>
          {login.isError && (
            <p className="text-body-sm text-error">Email hoặc mật khẩu không đúng</p>
          )}
          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>

        <p className="mt-4 text-center text-body-sm text-secondary">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  )
}
