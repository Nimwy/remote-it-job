import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { JobListItem } from "../types";
import { jobUrl } from "../lib/url";
import { timeAgo } from "../lib/date";
import { CompanyLogo } from "./CompanyLogo";
import { Icon } from "./ui/Icon";

export async function JobCard({ job }: { job: JobListItem }) {
  const t = await getTranslations("jobDetail");
  const jt = await getTranslations("jobType");
  const locale = await getLocale();

  const salaryText =
    job.salary_min || job.salary_max
      ? `${job.salary_min ?? "?"}${job.currency === "USD" ? "$" : ""} - ${job.salary_max ?? "?"}${job.currency === "USD" ? "$" : ""}`
      : t("negotiable");

  return (
    <Link
      href={jobUrl(job.slug, job.id)}
      className="group relative flex flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover"
    >
      <div className="absolute right-4 top-4 text-outline transition-colors hover:text-error">
        <Icon name="bookmark_border" className="text-[20px]" />
      </div>

      <div className="flex items-center gap-4">
        <CompanyLogo name={job.company_name} />
        <div className="min-w-0">
          <h3 className="truncate font-display text-headline-sm text-on-surface transition-colors group-hover:text-primary">
            {job.title}
          </h3>
          <p className="truncate text-body-sm text-on-surface-variant">{job.company_name}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-md bg-[#e0f2f1] px-2 py-1 text-label-sm uppercase tracking-wider text-[#00695c]">
          Remote
        </span>
        <span className="rounded-md bg-[#e1f5fe] px-2 py-1 text-label-sm uppercase tracking-wider text-[#0277bd]">
          {jt(job.job_type)}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
          <Icon name="payments" className="text-[16px] text-primary" />
          <span className="font-semibold text-on-surface">{salaryText}</span>
        </div>
        {job.location && (
          <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
            <Icon name="location_on" className="text-[16px]" />
            <span>{job.location}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
          <Icon name="schedule" className="text-[16px]" />
          <span>{timeAgo(job.created_at, locale as "vi" | "en")}</span>
        </div>
      </div>

      {job.tags.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-2 border-t border-outline-variant/30 pt-4">
          {job.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-outline-variant/50 bg-surface-container-low px-2 py-1 font-mono text-label-sm text-secondary"
            >
              {tag}
            </span>
          ))}
          {job.tags.length > 4 && (
            <span className="px-1 py-1 text-label-sm text-secondary">+{job.tags.length - 4}</span>
          )}
        </div>
      )}
    </Link>
  );
}
