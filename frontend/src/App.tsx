import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { AdminLayout } from './components/layout/AdminLayout'
import { RequireRole } from './components/guards'
import { HomePage } from './pages/HomePage'
import { JobsPage } from './pages/JobsPage'
import { JobDetailPage } from './pages/JobDetailPage'
import { AuthPage } from './pages/AuthPage'
import { HrDashboardPage } from './pages/HrDashboardPage'
import { PostJobPage } from './pages/PostJobPage'
import { EditJobPage } from './pages/EditJobPage'
import { HrProfilePage } from './pages/HrProfilePage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminJobsPage } from './pages/AdminJobsPage'
import { AdminManageJobsPage } from './pages/AdminManageJobsPage'
import { AdminUsersPage } from './pages/AdminUsersPage'
import { AdminCatalogPage } from './pages/AdminCatalogPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage initialTab="login" />} />
      <Route path="/register" element={<AuthPage initialTab="register" />} />

      <Route
        element={<Layout />}
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />

        <Route
          path="/hr"
          element={
            <RequireRole role="hr">
              <HrDashboardPage />
            </RequireRole>
          }
        />
        <Route
          path="/hr/jobs/new"
          element={
            <RequireRole role="hr">
              <PostJobPage />
            </RequireRole>
          }
        />
        <Route
          path="/hr/jobs/:id/edit"
          element={
            <RequireRole role="hr">
              <EditJobPage />
            </RequireRole>
          }
        />
        <Route
          path="/hr/profile"
          element={
            <RequireRole role="hr">
              <HrProfilePage />
            </RequireRole>
          }
        />

        <Route
          path="/admin"
          element={
            <RequireRole role="admin">
              <AdminLayout />
            </RequireRole>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="pending" element={<AdminJobsPage />} />
          <Route path="jobs" element={<AdminManageJobsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="catalog" element={<AdminCatalogPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
