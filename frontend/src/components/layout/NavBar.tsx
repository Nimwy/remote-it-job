import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useMe, useLogout } from '../../hooks/useAuth'
import { Button } from '../ui/Button'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-label-md ${
    isActive ? 'text-primary border-b-2 border-primary' : 'text-secondary hover:text-on-surface'
  }`

export function NavBar() {
  const { data: user, isLoading } = useMe()
  const logout = useLogout()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout.mutateAsync()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface">
      <div className="mx-auto flex h-16 max-w-container items-center justify-between gap-4 px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-headline-sm font-display text-primary">Remote IT</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/jobs" className={navLinkClass}>
            Tìm việc
          </NavLink>
          {user?.role === 'hr' && (
            <NavLink to="/hr" className={navLinkClass}>
              Dashboard
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={navLinkClass}>
              Quản trị
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {!isLoading && !user && (
            <>
              <Link to="/login">
                <Button variant="ghost">Đăng nhập</Button>
              </Link>
              <Link to="/register">
                <Button>Đăng tin</Button>
              </Link>
            </>
          )}
          {!isLoading && user?.role === 'hr' && (
            <>
              <Link to="/hr/jobs/new">
                <Button>Đăng tin</Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </>
          )}
          {!isLoading && user?.role === 'admin' && (
            <Button variant="ghost" onClick={handleLogout}>
              Đăng xuất
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
