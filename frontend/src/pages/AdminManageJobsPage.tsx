import { useState } from 'react'
import { useAdminJobs, useAdminJobAction, useAdminDeleteJob } from '../hooks/useAdmin'
import { JOB_STATUS_LABELS, JOB_TYPE_LABELS } from '../types'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'draft', label: 'Nháp' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Từ chối' },
  { value: 'closed', label: 'Đã đóng' },
  { value: 'hidden', label: 'Đã ẩn' },
  { value: 'expired', label: 'Hết hạn' },
]

export function AdminManageJobsPage() {
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const { data, isLoading } = useAdminJobs({ status: status || undefined, q: search || undefined })
  const action = useAdminJobAction()
  const deleteJob = useAdminDeleteJob()

  const jobs = data?.items ?? []

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-headline-lg">Quản lý tin tuyển dụng</h1>
        <p className="text-body-md text-on-surface-variant">Xem và quản lý toàn bộ tin đăng trên hệ thống.</p>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm tin..."
            className="h-10 w-64 rounded-lg border border-outline-variant bg-surface-container-lowest pl-10 pr-4 text-body-sm focus:border-primary focus:outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 cursor-pointer rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-sm focus:border-primary focus:outline-none"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-body-md text-secondary">Đang tải...</p>
      ) : jobs.length === 0 ? (
        <p className="text-body-md text-secondary">Không có tin tuyển dụng nào.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
          <table className="w-full text-left">
            <thead className="border-b border-outline-variant bg-surface text-label-sm text-secondary">
              <tr>
                <th className="p-4 font-semibold">Tiêu đề</th>
                <th className="p-4 font-semibold">Công ty</th>
                <th className="p-4 font-semibold">Loại</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 text-right font-semibold">Lượt xem</th>
                <th className="p-4 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-body-sm">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-surface-container-low">
                  <td className="p-4">
                    <div className="font-medium text-on-surface">{job.title}</div>
                    {job.rejection_reason && (
                      <div className="mt-1 max-w-[240px] text-[12px] text-error">{job.rejection_reason}</div>
                    )}
                  </td>
                  <td className="p-4 text-secondary">{job.company_name}</td>
                  <td className="p-4 text-secondary">{JOB_TYPE_LABELS[job.job_type] ?? job.job_type}</td>
                  <td className="p-4">
                    <Badge status={job.status}>{JOB_STATUS_LABELS[job.status]}</Badge>
                  </td>
                  <td className="p-4 text-right">{job.views}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      {job.status === 'approved' && (
                        <Button variant="outline" onClick={() => action.mutate({ action: 'hide', id: job.id })}>
                          Ẩn
                        </Button>
                      )}
                      {job.status === 'hidden' && (
                        <Button variant="outline" onClick={() => action.mutate({ action: 'unhide', id: job.id })}>
                          Hiện lại
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        onClick={() => {
                          if (window.confirm(`Xóa tin "${job.title}"?`)) {
                            deleteJob.mutate(job.id)
                          }
                        }}
                      >
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
