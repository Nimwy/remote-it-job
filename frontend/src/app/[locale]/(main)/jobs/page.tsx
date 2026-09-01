import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { JobCard } from "@/components/JobCard";
import { Icon } from "@/components/ui/Icon";
import { serverListCategories, serverListJobs, serverListTags } from "@/services/jobs";

function readParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const q = readParam(params.q);
  const category = readParam(params.category);
  const jobType = readParam(params.job_type);
  const location = readParam(params.location);
  const timezone = readParam(params.timezone);
  const tags = readParam(params.tags);
  const salaryMin = readParam(params.salary_min);
  const salaryMax = readParam(params.salary_max);
  const page = Number(readParam(params.page) || "1") || 1;

  const t = await getTranslations("jobs");
  const jt = await getTranslations("jobType");

  const [jobsData, categories, tagList] = await Promise.all([
    serverListJobs({ q, category, job_type: jobType, location, timezone, tags, salary_min: Number(salaryMin) || undefined, salary_max: Number(salaryMax) || undefined, page }),
    serverListCategories(),
    serverListTags(),
  ]);

  const totalPages = jobsData?.total_pages ?? 0;

  const buildPageUrl = (p: number) => {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (category) qs.set("category", category);
    if (jobType) qs.set("job_type", jobType);
    if (location) qs.set("location", location);
    if (timezone) qs.set("timezone", timezone);
    if (tags) qs.set("tags", tags);
    if (salaryMin) qs.set("salary_min", salaryMin);
    if (salaryMax) qs.set("salary_max", salaryMax);
    qs.set("page", String(p));
    return `/jobs?${qs.toString()}`;
  };

  const timezones = ["UTC+7", "UTC+8", "UTC+0", "UTC+9", "UTC-5", "UTC-8"];

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8">
      <div className="mb-6 flex flex-col gap-4">
        <h1 className="font-display text-headline-lg">
          {q
            ? t("resultCountQuery", { count: jobsData?.total ?? 0, q })
            : t("resultCount", { count: jobsData?.total ?? 0 })}
        </h1>

        <form method="GET" action="/jobs" className="flex gap-3">
          <div className="relative flex-1">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              name="q"
              defaultValue={q}
              placeholder={t("searchPlaceholder")}
              className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-10 pr-4 text-body-md focus:border-primary focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-primary px-6 text-label-md text-on-primary transition-colors hover:bg-primary-container"
          >
            {t("search")}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <form
          method="GET"
          action="/jobs"
          className="space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 lg:col-span-1"
        >
          <h2 className="text-label-md text-on-surface">{t("filter")}</h2>
          {q && <input type="hidden" name="q" value={q} />}
          {location && <input type="hidden" name="location" value={location} />}
          {timezone && <input type="hidden" name="timezone" value={timezone} />}
          {tags && <input type="hidden" name="tags" value={tags} />}
          {salaryMin && <input type="hidden" name="salary_min" value={salaryMin} />}
          {salaryMax && <input type="hidden" name="salary_max" value={salaryMax} />}

          <div>
            <label className="mb-1 block text-label-sm text-secondary">{t("category")}</label>
            <select
              name="category"
              defaultValue={category}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md focus:border-primary focus:outline-none"
            >
              <option value="">{t("all")}</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-label-sm text-secondary">{t("jobType")}</label>
            <select
              name="job_type"
              defaultValue={jobType}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md focus:border-primary focus:outline-none"
            >
              <option value="">{t("all")}</option>
              <option value="fulltime">{jt("fulltime")}</option>
              <option value="parttime">{jt("parttime")}</option>
              <option value="freelance">{jt("freelance")}</option>
              <option value="contract">{jt("contract")}</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-label-sm text-secondary">{t("location")}</label>
            <input
              name="location"
              defaultValue={location}
              placeholder="Việt Nam, Singapore..."
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-label-sm text-secondary">{t("timezone")}</label>
            <select
              name="timezone"
              defaultValue={timezone}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md focus:border-primary focus:outline-none"
            >
              <option value="">{t("all")}</option>
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-label-sm text-secondary">{t("tags")}</label>
            <select
              name="tags"
              defaultValue={tags}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md focus:border-primary focus:outline-none"
            >
              <option value="">{t("all")}</option>
              {tagList?.map((tag) => (
                <option key={tag.id} value={tag.slug}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-label-sm text-secondary">{t("salaryMin")}</label>
              <input
                type="number"
                name="salary_min"
                defaultValue={salaryMin}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-label-sm text-secondary">{t("salaryMax")}</label>
              <input
                type="number"
                name="salary_max"
                defaultValue={salaryMax}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-label-md text-on-surface hover:bg-surface-container-low"
          >
            {t("apply")}
          </button>
        </form>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-3">
          {jobsData && jobsData.items.length > 0 ? (
            <>
              {jobsData.items.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
              {totalPages > 1 && (
                <div className="col-span-full flex items-center justify-center gap-2 pt-4">
                  {page > 1 && (
                    <Link
                      href={buildPageUrl(page - 1)}
                      className="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-label-md text-on-surface"
                    >
                      {t("prev")}
                    </Link>
                  )}
                  <span className="text-body-sm text-secondary">
                    {t("page", { page, total: totalPages })}
                  </span>
                  {page < totalPages && (
                    <Link
                      href={buildPageUrl(page + 1)}
                      className="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-label-md text-on-surface"
                    >
                      {t("next")}
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="col-span-full flex flex-col items-center gap-3 rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest py-16 text-center">
              <Icon name="search_off" className="text-[48px] text-outline" />
              <p className="text-body-md text-secondary">{t("noResults")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
