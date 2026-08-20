import { Link } from 'react-router-dom'
import { useHrJobs, useSubmitJob, useCloseJob, useDeleteJob } from '../hooks/useHr'
import { JOB_STATUS_LABELS } from '../types'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

export function HrDashboardPage() {
  const { data, isLoading } = useHrJobs()
  const submitJob = useSubmitJob()
  const closeJob = useCloseJob()
  const deleteJob = useDeleteJob()

  if (isLoading) {
    return <div className="mx-auto max-w-container px-6 py-8 text-body-md text-secondary">Đang tải...</div>
  }

  const jobs = data?.items ?? []

  return (
    <div className="mx-auto max-w-container px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-headline-lg">Dashboard HR</h1>
          <p className="text-body-md text-secondary">Quản lý tin tuyển dụng của bạn</p>
        </div>
        <Link to="/hr/jobs/new">
          <Button>+ Đăng tin mới</Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <p className="text-body-md text-secondary">
          Bạn chưa có tin tuyển dụng nào.{' '}
          <Link to="/hr/jobs/new" className="text-primary hover:underline">
            Đăng tin đầu tiên
          </Link>
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
          <table className="w-full text-left">
            <thead className="border-b border-outline-variant text-label-sm text-secondary">
              <tr>
                <th className="px-4 py-3">Tiêu đề</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Lượt xem</th>
                <th className="px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-surface-container-low">
                  <td className="px-4 py-3">
                    <Link to={`/hr/jobs/${job.id}/edit`} className="font-medium text-on-surface hover:text-primary">
                      {job.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={job.status}>{JOB_STATUS_LABELS[job.status]}</Badge>
                    {job.rejection_reason && (
                      <p className="mt-1 max-w-[240px] text-body-sm text-error">{job.rejection_reason}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-body-md">{job.views}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {job.status === 'draft' && (
                        <Button variant="outline" onClick={() => submitJob.mutate(job.id)}>
                          Gửi duyệt
                        </Button>
                      )}
                      {job.status === 'rejected' && (
                        <Button variant="outline" onClick={() => submitJob.mutate(job.id)}>
                          Gửi lại
                        </Button>
                      )}
                      {job.status === 'approved' && (
                        <Button variant="outline" onClick={() => closeJob.mutate(job.id)}>
                          Đóng tin
                        </Button>
                      )}
                      {(job.status === 'draft' || job.status === 'rejected') && (
                        <Button variant="danger" onClick={() => deleteJob.mutate(job.id)}>
                          Xóa
                        </Button>
                      )}
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
