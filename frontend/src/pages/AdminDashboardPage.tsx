import { Link } from 'react-router-dom'
import { useAdminPendingJobs, useAdminHrs } from '../hooks/useAdmin'

export function AdminDashboardPage() {
  const { data: pendingJobs } = useAdminPendingJobs()
  const { data: hrs } = useAdminHrs()

  const stats = [
    { label: 'Tin chờ duyệt', value: pendingJobs?.total ?? 0 },
    { label: 'Tổng HR', value: hrs?.total ?? 0 },
  ]

  return (
    <div className="mx-auto max-w-container px-6 py-8">
      <h1 className="mb-6 font-display text-headline-lg">Tổng quan quản trị</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
            <p className="text-label-md text-secondary">{s.label}</p>
            <p className="mt-2 font-display text-display text-primary">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link to="/admin/jobs" className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 transition-shadow hover:shadow-card-hover">
          <h3 className="font-display text-headline-sm">Duyệt tin mới</h3>
          <p className="mt-1 text-body-sm text-secondary">Phê duyệt / từ chối tin tuyển dụng</p>
        </Link>
        <Link to="/admin/users" className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 transition-shadow hover:shadow-card-hover">
          <h3 className="font-display text-headline-sm">Quản lý HR</h3>
          <p className="mt-1 text-body-sm text-secondary">Duyệt / khóa tài khoản HR</p>
        </Link>
        <Link to="/admin/catalog" className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 transition-shadow hover:shadow-card-hover">
          <h3 className="font-display text-headline-sm">Quản lý catalog</h3>
          <p className="mt-1 text-body-sm text-secondary">Category và tag</p>
        </Link>
      </div>
    </div>
  )
}
