import { Link } from 'react-router-dom'
import type { JobListItem } from '../types'
import { JOB_TYPE_LABELS } from '../types'

export function JobCard({ job }: { job: JobListItem }) {
  const salary =
    job.salary_min || job.salary_max
      ? `${job.salary_min ?? '?'} - ${job.salary_max ?? '?'} ${job.currency ?? ''}`.trim()
      : 'Thỏa thuận'

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group relative block rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-card transition-shadow hover:shadow-card-hover"
    >
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-container-high font-display text-lg text-primary">
          {job.company_name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-headline-sm font-display text-on-surface group-hover:text-primary">
            {job.title}
          </h3>
          <p className="text-body-sm text-secondary">{job.company_name}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-tertiary-fixed px-2.5 py-0.5 text-label-sm text-on-surface">
              Remote
            </span>
            <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-label-sm text-secondary">
              {JOB_TYPE_LABELS[job.job_type] ?? job.job_type}
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-label-md text-primary">{salary}</p>
          {job.location && <p className="text-body-sm text-secondary">{job.location}</p>}
        </div>
      </div>
      {job.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-outline-variant pt-4">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-surface-container-low px-2.5 py-0.5 font-mono text-body-sm text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
