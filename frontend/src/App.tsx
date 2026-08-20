import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { RequireRole } from './components/guards'
import { HomePage } from './pages/HomePage'
import { JobsPage } from './pages/JobsPage'
import { JobDetailPage } from './pages/JobDetailPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { HrDashboardPage } from './pages/HrDashboardPage'
import { PostJobPage } from './pages/PostJobPage'
import { EditJobPage } from './pages/EditJobPage'
import { HrProfilePage } from './pages/HrProfilePage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminJobsPage } from './pages/AdminJobsPage'
import { AdminUsersPage } from './pages/AdminUsersPage'
import { AdminCatalogPage } from './pages/AdminCatalogPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

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
              <AdminDashboardPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/jobs"
          element={
            <RequireRole role="admin">
              <AdminJobsPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireRole role="admin">
              <AdminUsersPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/catalog"
          element={
            <RequireRole role="admin">
              <AdminCatalogPage />
            </RequireRole>
          }
        />
      </Routes>
    </Layout>
  )
}
