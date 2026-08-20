import { Link } from 'react-router-dom'
import { useJobs } from '../hooks/useJobs'
import { JobCard } from '../components/JobCard'

export function HomePage() {
  const { data, isLoading } = useJobs({ page: 1, page_size: 9 })

  return (
    <div>
      <section className="mx-auto max-w-container px-6 py-16 text-center">
        <h1 className="mx-auto max-w-3xl font-display text-display text-on-surface">
          Remote IT — Tìm việc làm remote dễ dàng
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-body-lg text-secondary">
          Khám phá cơ hội việc làm IT remote phù hợp với kỹ năng của bạn, không cần tạo tài khoản.
        </p>
        <Link
          to="/jobs"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-label-md text-on-primary transition-colors hover:bg-primary-container"
        >
          Tìm việc ngay
        </Link>
      </section>

      <section className="mx-auto max-w-container px-6 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-headline-md font-display">Việc làm nổi bật</h2>
        </div>
        {isLoading ? (
          <p className="text-body-md text-secondary">Đang tải...</p>
        ) : data && data.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <p className="text-body-md text-secondary">Chưa có tin tuyển dụng nào.</p>
        )}
      </section>
    </div>
  )
}
