import { Link } from 'react-router-dom'
import { useHrJobs, useSubmitJob, useCloseJob, useDeleteJob } from '../hooks/useHr'
import { JOB_STATUS_LABELS } from '../types'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'

function StatCard({
  label,
  value,
  icon,
  color,
  total,
}: {
  label: string
  value: number
  icon: string
  color: string
  total: number
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="relative flex flex-col gap-2 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="absolute right-0 top-0 p-4 opacity-10">
        <Icon name={icon} className="text-[64px]" />
      </div>
      <span className="text-label-sm uppercase tracking-wider text-secondary">{label}</span>
      <span className="font-display text-headline-lg text-on-surface">{value}</span>
      <div className="mt-auto h-1 w-full rounded-full bg-surface-variant">
        <div className={`h-1 rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

export function HrDashboardPage() {
  const { data, isLoading } = useHrJobs()
  const submitJob = useSubmitJob()
  const closeJob = useCloseJob()
  const deleteJob = useDeleteJob()

  if (isLoading) {
    return <div className="mx-auto max-w-container px-6 py-8 text-body-md text-secondary">Đang tải...</div>
  }

  const jobs = data?.items ?? []
  const total = data?.total ?? 0
  const openCount = jobs.filter((j) => j.status === 'approved').length
  const pendingCount = jobs.filter((j) => j.status === 'pending').length
  const closedCount = jobs.filter((j) => j.status === 'closed').length

  return (
    <div className="mx-auto max-w-container px-6 py-8">
      <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-headline-lg">Xin chào</h1>
          <p className="text-body-md text-secondary">Đây là tổng quan về các tin tuyển dụng của bạn.</p>
        </div>
        <Link to="/hr/jobs/new">
          <Button>
            <Icon name="add" className="text-[18px]" />
            Đăng tin mới
          </Button>
        </Link>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tổng tin" value={total} icon="list_alt" color="bg-primary" total={total || 1} />
        <StatCard label="Đang mở" value={openCount} icon="check_circle" color="bg-primary" total={total || 1} />
        <StatCard label="Chờ duyệt" value={pendingCount} icon="hourglass_empty" color="bg-tertiary-container" total={total || 1} />
        <StatCard label="Đã đóng" value={closedCount} icon="block" color="bg-secondary" total={total || 1} />
      </section>

      <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface p-4">
          <h2 className="font-display text-headline-sm text-on-surface">Danh sách tin tuyển dụng</h2>
        </div>

        {jobs.length === 0 ? (
          <p className="p-6 text-body-md text-secondary">
            Bạn chưa có tin tuyển dụng nào.{' '}
            <Link to="/hr/jobs/new" className="text-primary hover:underline">
              Đăng tin đầu tiên
            </Link>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-outline-variant bg-surface text-label-sm text-secondary">
                <tr>
                  <th className="p-4 font-semibold">Tiêu đề tin</th>
                  <th className="p-4 font-semibold">Trạng thái</th>
                  <th className="p-4 text-right font-semibold">Lượt xem</th>
                  <th className="p-4 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-body-sm">
                {jobs.map((job) => (
                  <tr key={job.id} className="group hover:bg-surface-container-low">
                    <td className="p-4">
                      <Link
                        to={`/hr/jobs/${job.id}/edit`}
                        className="text-label-md text-on-surface transition-colors group-hover:text-primary"
                      >
                        {job.title}
                      </Link>
                      {job.location && (
                        <div className="mt-1 flex items-center gap-1 text-[12px] text-secondary">
                          <Icon name="location_on" className="text-[14px]" />
                          {job.location}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge status={job.status}>{JOB_STATUS_LABELS[job.status]}</Badge>
                      {job.rejection_reason && (
                        <p className="mt-1 max-w-[240px] text-[12px] text-error">{job.rejection_reason}</p>
                      )}
                    </td>
                    <td className="p-4 text-right font-medium">{job.views}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
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
                        {(job.status === 'draft' || job.status === 'rejected' || job.status === 'closed') && (
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
      </section>
    </div>
  )
}
