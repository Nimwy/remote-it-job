import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useMe } from '../hooks/useAuth'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useMe()

  if (isLoading) {
    return <div className="mx-auto max-w-container px-6 py-12 text-body-md text-secondary">Đang tải...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export function RequireRole({ role, children }: { role: 'hr' | 'admin'; children: ReactNode }) {
  const { data: user, isLoading } = useMe()

  if (isLoading) {
    return <div className="mx-auto max-w-container px-6 py-12 text-body-md text-secondary">Đang tải...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== role) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
