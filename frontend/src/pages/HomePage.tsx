import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useJobs, useCategories } from '../hooks/useJobs'
import { JobCard } from '../components/JobCard'
import { Icon } from '../components/ui/Icon'

export function HomePage() {
  const navigate = useNavigate()
  const { data, isLoading } = useJobs({ page: 1, page_size: 9 })
  const { data: categories } = useCategories()

  const [selectedCategory, setSelectedCategory] = useState('')
  const [salary, setSalary] = useState('')
  const [region, setRegion] = useState('')
  const [jobType, setJobType] = useState('')
  const [remoteOnly, setRemoteOnly] = useState(true)

  const applyCategory = (slug: string) => {
    setSelectedCategory(slug)
    navigate(slug ? `/jobs?category=${slug}` : '/jobs')
  }

  const salaryRanges = [
    { value: '', label: 'Mức lương' },
    { value: '1', label: 'Dưới $1000' },
    { value: '2', label: '$1000 - $2000' },
    { value: '3', label: '$2000 - $4000' },
    { value: '4', label: 'Trên $4000' },
  ]

  return (
    <div className="mx-auto max-w-container px-6 py-8">
      {/* Hero */}
      <section className="flex flex-col items-center gap-4 py-8 text-center md:py-16">
        <h1 className="max-w-3xl font-display text-display leading-tight">
          Remote IT — Tìm việc làm remote dễ dàng
        </h1>
        <p className="max-w-2xl text-body-lg text-on-surface-variant">
          Khám phá hàng ngàn cơ hội việc làm từ xa chất lượng cao, dành riêng cho các kỹ sư và
          chuyên gia công nghệ tại Việt Nam và toàn cầu.
        </p>
        <div className="relative mt-4 w-full max-w-xl md:hidden">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            placeholder="Tìm kiếm từ khóa..."
            className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-low pl-10 pr-4 text-body-md focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </section>

      {/* Filters */}
      <section className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
        <div className="flex flex-wrap gap-2 border-b border-outline-variant pb-4">
          <button
            onClick={() => applyCategory('')}
            className={`rounded-full border px-4 py-1.5 text-label-md transition-colors ${
              selectedCategory === ''
                ? 'border-primary-container bg-primary-container text-on-primary-container'
                : 'border-outline-variant bg-surface-container text-on-surface hover:bg-surface-variant'
            }`}
          >
            Tất cả
          </button>
          {categories?.map((c) => (
            <button
              key={c.id}
              onClick={() => applyCategory(c.slug)}
              className={`rounded-full border px-4 py-1.5 text-label-md transition-colors ${
                selectedCategory === c.slug
                  ? 'border-primary-container bg-primary-container text-on-primary-container'
                  : 'border-outline-variant bg-surface-container text-on-surface hover:bg-surface-variant'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon name="filter_list" className="text-sm text-outline" />
            <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">Bộ lọc</span>
          </div>
          <select
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="h-10 cursor-pointer appearance-none rounded-lg border border-outline-variant bg-surface-container-low pl-3 pr-8 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {salaryRanges.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="h-10 cursor-pointer appearance-none rounded-lg border border-outline-variant bg-surface-container-low pl-3 pr-8 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="">Khu vực</option>
            <option value="vn">Việt Nam</option>
            <option value="global">Toàn cầu</option>
            <option value="asia">Châu Á</option>
          </select>
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="h-10 cursor-pointer appearance-none rounded-lg border border-outline-variant bg-surface-container-low pl-3 pr-8 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="">Loại công việc</option>
            <option value="fulltime">Full-time</option>
            <option value="parttime">Part-time</option>
            <option value="contract">Contract</option>
          </select>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-label-sm text-on-surface-variant">Chỉ Remote</span>
            <button
              role="switch"
              aria-checked={remoteOnly}
              onClick={() => setRemoteOnly(!remoteOnly)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                remoteOnly ? 'bg-primary' : 'bg-surface-variant'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                  remoteOnly ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="mt-8 flex flex-col gap-6">
        <div className="mb-2 flex items-end justify-between">
          <h2 className="font-display text-headline-md">Việc làm nổi bật</h2>
          <span className="text-label-md text-secondary">
            {data ? `${data.total} việc làm` : ''}
          </span>
        </div>

        {isLoading ? (
          <p className="text-body-md text-secondary">Đang tải...</p>
        ) : data && data.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <p className="text-body-md text-secondary">Chưa có tin tuyển dụng nào.</p>
        )}

        <div className="flex justify-center">
          <Link
            to="/jobs"
            className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container px-6 py-3 text-label-md text-on-surface shadow-sm transition-colors hover:bg-surface-variant"
          >
            Xem thêm tin tuyển dụng
            <Icon name="arrow_downward" className="text-[18px]" />
          </Link>
        </div>
      </section>
    </div>
  )
}
