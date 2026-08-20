import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useRegister } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'

const schema = z
  .object({
    name: z.string().min(1, 'Vui lòng nhập tên'),
    company_name: z.string().min(1, 'Vui lòng nhập tên công ty'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirm_password'],
  })

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const registerUser = useRegister()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    const { confirm_password: _confirm, ...payload } = data
    await registerUser.mutateAsync(payload)
    navigate('/login')
  }

  return (
    <div className="mx-auto max-w-[480px] px-6 py-12">
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-card">
        <h1 className="mb-6 font-display text-headline-md">Tạo tài khoản HR</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-label-sm text-secondary">Tên</label>
            <input
              {...register('name')}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-md focus:border-primary focus:outline-none"
            />
            {errors.name && <p className="mt-1 text-body-sm text-error">{errors.name.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-label-sm text-secondary">Tên công ty</label>
            <input
              {...register('company_name')}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-md focus:border-primary focus:outline-none"
            />
            {errors.company_name && (
              <p className="mt-1 text-body-sm text-error">{errors.company_name.message}</p>
            )}
          </div>
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
          <div>
            <label className="mb-1 block text-label-sm text-secondary">Xác nhận mật khẩu</label>
            <input
              type="password"
              {...register('confirm_password')}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-md focus:border-primary focus:outline-none"
            />
            {errors.confirm_password && (
              <p className="mt-1 text-body-sm text-error">{errors.confirm_password.message}</p>
            )}
          </div>
          {registerUser.isError && (
            <p className="text-body-sm text-error">Đăng ký thất bại. Email có thể đã tồn tại.</p>
          )}
          <Button type="submit" className="w-full" disabled={registerUser.isPending}>
            {registerUser.isPending ? 'Đang tạo...' : 'Tạo tài khoản'}
          </Button>
        </form>

        <p className="mt-4 text-center text-body-sm text-secondary">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}
