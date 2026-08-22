import Link from "next/link";
import type { JobListItem } from "../types";
import { JOB_TYPE_LABELS } from "../types";
import { jobUrl } from "../lib/url";
import { Icon } from "./ui/Icon";

export function JobCard({ job }: { job: JobListItem }) {
  const salaryText =
    job.salary_min || job.salary_max
      ? `${job.salary_min ?? "?"}${job.currency === "USD" ? "$" : ""} - ${job.salary_max ?? "?"}${job.currency === "USD" ? "$" : ""}`
      : "Thỏa thuận";

  return (
    <Link
      href={jobUrl(job.slug, job.id)}
      className="group relative flex flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 transition-shadow hover:shadow-card-hover"
    >
      <div className="absolute right-4 top-4 text-outline transition-colors hover:text-error">
        <Icon name="bookmark_border" className="text-[20px]" />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-outline-variant bg-surface-container">
          <span className="font-display text-lg text-on-surface-variant">
            {job.company_name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="font-display text-headline-sm text-on-surface transition-colors group-hover:text-primary">
            {job.title}
          </h3>
          <p className="text-body-sm text-on-surface-variant">{job.company_name}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded bg-[#e0f2f1] px-2 py-1 text-label-sm uppercase tracking-wider text-[#00695c]">
          Remote
        </span>
        <span className="rounded bg-[#e1f5fe] px-2 py-1 text-label-sm uppercase tracking-wider text-[#0277bd]">
          {JOB_TYPE_LABELS[job.job_type] ?? job.job_type}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
          <Icon name="payments" className="text-[16px]" />
          <span className="font-medium text-on-surface">{salaryText}</span>
        </div>
        {job.location && (
          <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
            <Icon name="location_on" className="text-[16px]" />
            <span>{job.location}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
          <Icon name="schedule" className="text-[16px]" />
          <span>{JOB_TYPE_LABELS[job.job_type] ?? job.job_type}</span>
        </div>
      </div>

      {job.tags.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-2 border-t border-outline-variant/30 pt-4">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-outline-variant/50 bg-surface-container-low px-2 py-1 text-label-sm text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
