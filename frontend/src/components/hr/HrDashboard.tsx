"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useHrJobs, useHrStats, useSubmitJob, useCloseJob, useDeleteJob } from "@/hooks/useHr";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

function StatCard({
  label,
  value,
  icon,
  color,
  total,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
  total: number;
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="relative flex flex-col gap-2 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm transition-shadow hover:shadow-card-hover">
      <div className="absolute right-0 top-0 p-4 opacity-10">
        <Icon name={icon} className="text-[64px]" />
      </div>
      <span className="text-label-sm uppercase tracking-wider text-secondary">{label}</span>
      <span className="font-display text-headline-lg text-on-surface">{value}</span>
      <div className="mt-auto h-1 w-full rounded-full bg-surface-variant">
        <div className={`h-1 rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function HrDashboard() {
  const t = useTranslations("hr");
  const st = useTranslations("status");
  const { data, isLoading, isError } = useHrJobs();
  const { data: stats } = useHrStats();
  const submitJob = useSubmitJob();
  const closeJob = useCloseJob();
  const deleteJob = useDeleteJob();

  if (isLoading) {
    return <div className="mx-auto max-w-[1280px] px-6 py-8 text-body-md text-secondary">{t("loading")}</div>;
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-8">
        <p className="text-body-md text-error">{t("pendingApproval")}</p>
      </div>
    );
  }

  const jobs = data?.items ?? [];
  const total = stats?.total ?? 0;
  const openCount = stats?.open ?? 0;
  const pendingCount = stats?.pending ?? 0;
  const closedCount = stats?.closed ?? 0;

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8">
      <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-headline-lg">{t("hello")}</h1>
          <p className="text-body-md text-secondary">{t("subtitle")}</p>
        </div>
        <Link href="/hr/jobs/new">
          <Button>
            <Icon name="add" className="text-[18px]" />
            {t("postNew")}
          </Button>
        </Link>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("totalJobs")} value={total} icon="list_alt" color="bg-primary" total={total || 1} />
        <StatCard label={t("open")} value={openCount} icon="check_circle" color="bg-primary" total={total || 1} />
        <StatCard label={t("pending")} value={pendingCount} icon="hourglass_empty" color="bg-tertiary-container" total={total || 1} />
        <StatCard label={t("closed")} value={closedCount} icon="block" color="bg-secondary" total={total || 1} />
      </section>

      <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface p-4">
          <h2 className="font-display text-headline-sm text-on-surface">{t("jobList")}</h2>
        </div>

        {jobs.length === 0 ? (
          <p className="p-6 text-body-md text-secondary">
            {t("noJobs")}{" "}
            <Link href="/hr/jobs/new" className="text-primary hover:underline">
              {t("postFirst")}
            </Link>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-outline-variant bg-surface text-label-sm text-secondary">
                <tr>
                  <th className="p-4 font-semibold">{t("jobList")}</th>
                  <th className="p-4 font-semibold">{t("pending")}</th>
                  <th className="p-4 text-right font-semibold">Views</th>
                  <th className="p-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-body-sm">
                {jobs.map((job) => (
                  <tr key={job.id} className="group hover:bg-surface-container-low">
                    <td className="p-4">
                      <Link
                        href={`/hr/jobs/${job.id}/edit`}
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
                      <Badge status={job.status}>{st(job.status)}</Badge>
                      {job.rejection_reason && (
                        <p className="mt-1 max-w-[240px] text-[12px] text-error">{job.rejection_reason}</p>
                      )}
                    </td>
                    <td className="p-4 text-right font-medium">{job.views}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        {job.status === "draft" && (
                          <Button variant="outline" onClick={() => submitJob.mutate(job.id)}>
                            {t("submit")}
                          </Button>
                        )}
                        {job.status === "rejected" && (
                          <Button variant="outline" onClick={() => submitJob.mutate(job.id)}>
                            {t("resubmit")}
                          </Button>
                        )}
                        {job.status === "approved" && (
                          <Button variant="outline" onClick={() => closeJob.mutate(job.id)}>
                            {t("closeJob")}
                          </Button>
                        )}
                        {(job.status === "draft" || job.status === "rejected" || job.status === "closed") && (
                          <Button variant="danger" onClick={() => deleteJob.mutate(job.id)}>
                            {t("delete")}
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
  );
}
