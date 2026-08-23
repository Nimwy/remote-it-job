import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { JobCard } from "@/components/JobCard";
import { Icon } from "@/components/ui/Icon";
import { serverListCategories, serverListJobs } from "@/services/jobs";

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
  const page = Number(readParam(params.page) || "1") || 1;

  const t = await getTranslations("jobs");
  const jt = await getTranslations("jobType");

  const [jobsData, categories] = await Promise.all([
    serverListJobs({ q, category, job_type: jobType, page }),
    serverListCategories(),
  ]);

  const totalPages = jobsData?.total_pages ?? 0;

  const buildPageUrl = (p: number) => {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (category) qs.set("category", category);
    if (jobType) qs.set("job_type", jobType);
    qs.set("page", String(p));
    return `/jobs?${qs.toString()}`;
  };

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

          <button
            type="submit"
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-label-md text-on-surface hover:bg-surface-container-low"
          >
            {t("apply")}
          </button>
        </form>

        <div className="space-y-4 lg:col-span-3">
          {jobsData && jobsData.items.length > 0 ? (
            <>
              {jobsData.items.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
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
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest py-16 text-center">
              <Icon name="search_off" className="text-[48px] text-outline" />
              <p className="text-body-md text-secondary">{t("noResults")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
