import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useMe, useLogout } from '../../hooks/useAuth'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-label-md transition-colors ${
    isActive ? 'text-primary border-b-2 border-primary' : 'text-secondary hover:text-primary'
  }`

export function NavBar() {
  const { data: user, isLoading } = useMe()
  const logout = useLogout()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleLogout = async () => {
    await logout.mutateAsync()
    navigate('/')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(query.trim() ? `/jobs?q=${encodeURIComponent(query.trim())}` : '/jobs')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface shadow-sm">
      <div className="mx-auto flex h-16 max-w-container items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Icon name="work" fill className="text-primary" />
            <span className="font-display text-headline-sm font-bold tracking-tight text-primary">
              Remote IT
            </span>
          </Link>

          <nav className="hidden items-center gap-4 md:flex">
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
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative hidden w-64 md:block">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm từ khóa..."
              className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container pl-10 pr-4 text-body-sm placeholder:text-outline-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </form>

          {!isLoading && !user && (
            <>
              <Link to="/login" className="hidden sm:block">
                <Button variant="outline">Đăng nhập</Button>
              </Link>
              <Link to="/register">
                <Button>
                  <Icon name="add" className="text-[18px]" />
                  <span className="hidden sm:inline">Đăng tin</span>
                </Button>
              </Link>
            </>
          )}
          {!isLoading && user?.role === 'hr' && (
            <>
              <Link to="/hr/jobs/new" className="hidden md:block">
                <Button>
                  <Icon name="add" className="text-[18px]" />
                  Đăng tin
                </Button>
              </Link>
              <button onClick={handleLogout} className="hidden text-label-md text-secondary hover:text-primary md:block">
                Đăng xuất
              </button>
            </>
          )}
          {!isLoading && user?.role === 'admin' && (
            <button onClick={handleLogout} className="hidden text-label-md text-secondary hover:text-primary md:block">
              Đăng xuất
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
