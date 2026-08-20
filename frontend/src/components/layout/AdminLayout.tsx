import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdminPendingJobs } from '../../hooks/useAdmin'
import { useLogout } from '../../hooks/useAuth'
import { Icon } from '../ui/Icon'

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-4 rounded-lg px-4 py-2 text-label-md transition-all ${
    isActive
      ? 'bg-primary-container font-bold text-on-primary-container'
      : 'text-on-surface-variant hover:bg-surface-variant'
  }`

export function AdminLayout() {
  const { data: pending } = useAdminPendingJobs()
  const logout = useLogout()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout.mutateAsync()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="fixed left-0 top-16 z-30 flex h-[calc(100vh-4rem)] w-64 flex-col border-r border-outline-variant bg-surface-container p-4 shadow-sm">
        <div className="mb-8 flex items-center gap-4 px-2">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-variant">
            <Icon name="admin_panel_settings" className="text-[24px] text-on-surface-variant" />
          </div>
          <div>
            <h2 className="font-display text-headline-sm leading-tight text-primary">Admin Portal</h2>
            <p className="text-label-sm text-on-surface-variant">Manage Listings</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          <NavLink to="/admin" end className={navItemClass}>
            <Icon name="dashboard" fill />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/pending" className={navItemClass}>
            <Icon name="pending_actions" />
            <span className="flex-1">Duyệt tin</span>
            {pending && pending.total > 0 && (
              <span className="rounded-full bg-error px-2 py-0.5 text-label-sm text-on-error">
                {pending.total}
              </span>
            )}
          </NavLink>
          <NavLink to="/admin/jobs" className={navItemClass}>
            <Icon name="work_history" />
            <span>Quản lý tin</span>
          </NavLink>
          <NavLink to="/admin/users" className={navItemClass}>
            <Icon name="group" />
            <span>Quản lý HR</span>
          </NavLink>
          <NavLink to="/admin/catalog" className={navItemClass}>
            <Icon name="category" />
            <span>Catalog</span>
          </NavLink>
        </nav>

        <div className="mt-auto flex flex-col gap-4">
          <div className="h-px w-full bg-outline-variant" />
          <a href="/" className="flex items-center gap-4 rounded-lg px-4 py-1 text-label-md text-on-surface-variant hover:bg-surface-variant">
            <Icon name="help" className="text-sm" />
            <span>Trang chủ</span>
          </a>
          <button onClick={handleLogout} className="flex items-center gap-4 rounded-lg px-4 py-1 text-label-md text-on-surface-variant hover:bg-surface-variant">
            <Icon name="logout" className="text-sm" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="ml-64 w-full max-w-container px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
