import Link from "next/link";
import { JobCard } from "@/components/JobCard";
import { Icon } from "@/components/ui/Icon";
import { serverListCategories, serverListJobs } from "@/services/jobs";

function readParam(
  value: string | string[] | undefined,
): string {
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
          {jobsData?.total ?? 0} việc làm remote{q ? ` cho "${q}"` : ""}
        </h1>

        <form method="GET" action="/jobs" className="flex gap-3">
          <div className="relative flex-1">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Tìm kiếm công việc..."
              className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-10 pr-4 text-body-md focus:border-primary focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-primary px-6 text-label-md text-on-primary transition-colors hover:bg-primary-container"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <form method="GET" action="/jobs" className="space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 lg:col-span-1">
          <h2 className="text-label-md text-on-surface">Lọc theo</h2>
          {q && <input type="hidden" name="q" value={q} />}

          <div>
            <label className="mb-1 block text-label-sm text-secondary">Category</label>
            <select
              name="category"
              defaultValue={category}
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
              name="job_type"
              defaultValue={jobType}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md focus:border-primary focus:outline-none"
            >
              <option value="">Tất cả</option>
              <option value="fulltime">Toàn thời gian</option>
              <option value="parttime">Bán thời gian</option>
              <option value="freelance">Freelance</option>
              <option value="contract">Hợp đồng</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-label-md text-on-surface hover:bg-surface-container-low"
          >
            Áp dụng
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
                      Trước
                    </Link>
                  )}
                  <span className="text-body-sm text-secondary">
                    Trang {page} / {totalPages}
                  </span>
                  {page < totalPages && (
                    <Link
                      href={buildPageUrl(page + 1)}
                      className="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-label-md text-on-surface"
                    >
                      Sau
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-body-md text-secondary">Không tìm thấy tin tuyển dụng phù hợp.</p>
          )}
        </div>
      </div>
    </div>
  );
}
