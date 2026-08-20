import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useJobs, useCategories } from '../hooks/useJobs'
import { JobCard } from '../components/JobCard'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'

export function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const [category, setCategory] = useState(searchParams.get('category') ?? '')
  const [jobType, setJobType] = useState(searchParams.get('job_type') ?? '')
  const [sort, setSort] = useState(searchParams.get('sort') ?? 'latest')
  const page = Number(searchParams.get('page') ?? 1)

  const { data: categories } = useCategories()
  const { data, isLoading } = useJobs({
    q: searchParams.get('q') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    job_type: searchParams.get('job_type') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
    page,
  })

  const applyFilters = () => {
    const params: Record<string, string> = {}
    if (q) params.q = q
    if (category) params.category = category
    if (jobType) params.job_type = jobType
    if (sort) params.sort = sort
    params.page = '1'
    setSearchParams(params)
  }

  const setPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(newPage))
    setSearchParams(params)
  }

  return (
    <div className="mx-auto max-w-container px-6 py-8">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <h1 className="font-display text-headline-lg">
            {data?.total ?? 0} việc làm remote{q ? ` cho "${q}"` : ''}
          </h1>
          <div className="relative">
            <Icon name="swap_vert" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-outline" />
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value)
                const params = new URLSearchParams(searchParams)
                params.set('sort', e.target.value)
                setSearchParams(params)
              }}
              className="h-10 cursor-pointer appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest pl-3 pr-10 text-sm focus:border-primary focus:outline-none"
            >
              <option value="latest">Mới nhất</option>
              <option value="relevant">Phù hợp nhất</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              placeholder="Tìm kiếm công việc..."
              className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-10 pr-4 text-body-md focus:border-primary focus:outline-none"
            />
          </div>
          <Button onClick={applyFilters}>Tìm kiếm</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <aside className="space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 lg:col-span-1">
          <h2 className="text-label-md text-on-surface">Lọc theo</h2>

          <div>
            <label className="mb-1 block text-label-sm text-secondary">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md focus:border-primary focus:outline-none"
            >
              <option value="">Tất cả</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-label-sm text-secondary">Loại công việc</label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md focus:border-primary focus:outline-none"
            >
              <option value="">Tất cả</option>
              <option value="fulltime">Toàn thời gian</option>
              <option value="parttime">Bán thời gian</option>
              <option value="freelance">Freelance</option>
              <option value="contract">Hợp đồng</option>
            </select>
          </div>

          <Button variant="outline" className="w-full" onClick={applyFilters}>
            Áp dụng
          </Button>
        </aside>

        <div className="space-y-4 lg:col-span-3">
          {isLoading ? (
            <p className="text-body-md text-secondary">Đang tải...</p>
          ) : data && data.items.length > 0 ? (
            <>
              {data.items.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
              {data.total_pages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Trước
                  </Button>
                  <span className="text-body-sm text-secondary">
                    Trang {data.page} / {data.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page >= data.total_pages}
                    onClick={() => setPage(page + 1)}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-body-md text-secondary">Không tìm thấy tin tuyển dụng phù hợp.</p>
          )}
        </div>
      </div>
    </div>
  )
}
