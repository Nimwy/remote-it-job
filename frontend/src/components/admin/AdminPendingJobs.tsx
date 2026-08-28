"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAdminPendingJobs, useAdminJobAction } from "@/hooks/useAdmin";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function AdminPendingJobs() {
  const t = useTranslations("admin");
  const st = useTranslations("status");
  const jt = useTranslations("jobType");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminPendingJobs(page);
  const action = useAdminJobAction();
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  if (isLoading) {
    return <div className="text-body-md text-secondary">{t("noPending")}</div>;
  }

  const jobs = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.total_pages ?? 0;

  return (
    <div>
      <h1 className="mb-2 font-display text-headline-lg">{t("pendingTitle")}</h1>
      <p className="mb-6 text-body-md text-secondary">{t("pendingSubtitle", { count: total })}</p>

      {jobs.length === 0 ? (
        <p className="text-body-md text-secondary">{t("noPending")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {jobs.map((job) => (
            <div key={job.id} className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-container-high font-display text-lg text-primary">
                  {job.company_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-headline-sm">{job.title}</h3>
                  <p className="text-body-sm text-secondary">{job.company_name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge status={job.status}>{st(job.status)}</Badge>
                    <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-label-sm text-secondary">
                      {jt(job.job_type)}
                    </span>
                    {job.location && (
                      <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-label-sm text-secondary">
                        <Icon name="location_on" className="text-[16px]" /> {job.location}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 space-y-1 text-body-sm text-secondary">
                    <p>
                      <strong>{t("description")}</strong> {job.description.slice(0, 120)}...
                    </p>
                    <p>
                      <strong>{t("requirements")}</strong> {job.requirements.slice(0, 120)}...
                    </p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {job.tags.map((tg) => (
                      <span key={tg} className="rounded-full bg-surface-container-low px-2 py-0.5 font-mono text-body-sm">
                        {tg}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {rejectingId === job.id ? (
                <div className="mt-4 space-y-2">
                  <input
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder={t("rejectPlaceholder")}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-md focus:border-primary focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      onClick={() => {
                        action.mutate({ action: "reject", id: job.id, reason: rejectReason });
                        setRejectingId(null);
                        setRejectReason("");
                      }}
                    >
                      {t("confirmReject")}
                    </Button>
                    <Button variant="ghost" onClick={() => setRejectingId(null)}>
                      {t("cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex gap-2">
                  <Button className="flex-1" onClick={() => action.mutate({ action: "approve", id: job.id })}>
                    {t("approve")}
                  </Button>
                  <Button variant="danger" onClick={() => setRejectingId(job.id)}>
                    {t("reject")}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            {t("prev")}
          </Button>
          <span className="text-body-sm text-secondary">
            {t("page", { page, total: totalPages })}
          </span>
          <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            {t("next")}
          </Button>
        </div>
      )}
    </div>
  );
}
