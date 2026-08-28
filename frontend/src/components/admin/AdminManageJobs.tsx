"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAdminJobs, useAdminJobAction, useAdminDeleteJob } from "@/hooks/useAdmin";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function AdminManageJobs() {
  const t = useTranslations("admin");
  const st = useTranslations("status");
  const jt = useTranslations("jobType");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminJobs({ status: status || undefined, q: search || undefined });
  const action = useAdminJobAction();
  const deleteJob = useAdminDeleteJob();

  const jobs = data?.items ?? [];

  const statusOptions = ["draft", "pending", "approved", "rejected", "closed", "hidden", "expired"];

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-headline-lg">{t("manageJobsTitle")}</h1>
        <p className="text-body-md text-on-surface-variant">{t("manageJobsSubtitle")}</p>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-10 w-64 rounded-lg border border-outline-variant bg-surface-container-lowest pl-10 pr-4 text-body-sm focus:border-primary focus:outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 cursor-pointer rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">{t("allStatuses")}</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {st(s)}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-body-md text-secondary">{t("loading")}</p>
      ) : jobs.length === 0 ? (
        <p className="text-body-md text-secondary">{t("noJobs")}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
          <table className="w-full text-left">
            <thead className="border-b border-outline-variant bg-surface text-label-sm text-secondary">
              <tr>
                <th className="p-4 font-semibold">{t("title")}</th>
                <th className="p-4 font-semibold">{t("company")}</th>
                <th className="p-4 font-semibold">{t("type")}</th>
                <th className="p-4 font-semibold">{t("status")}</th>
                <th className="p-4 text-right font-semibold">{t("views")}</th>
                <th className="p-4 text-right font-semibold">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-body-sm">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-surface-container-low">
                  <td className="p-4">
                    <div className="font-medium text-on-surface">{job.title}</div>
                    {job.rejection_reason && (
                      <div className="mt-1 max-w-[240px] text-[12px] text-error">{job.rejection_reason}</div>
                    )}
                  </td>
                  <td className="p-4 text-secondary">{job.company_name}</td>
                  <td className="p-4 text-secondary">{jt(job.job_type)}</td>
                  <td className="p-4">
                    <Badge status={job.status}>{st(job.status)}</Badge>
                  </td>
                  <td className="p-4 text-right">{job.views}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      {job.status === "approved" && (
                        <Button variant="outline" onClick={() => action.mutate({ action: "hide", id: job.id })}>
                          {t("hide")}
                        </Button>
                      )}
                      {job.status === "hidden" && (
                        <Button variant="outline" onClick={() => action.mutate({ action: "unhide", id: job.id })}>
                          {t("unhide")}
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        onClick={() => {
                          if (window.confirm(t("confirmDelete", { title: job.title }))) {
                            deleteJob.mutate(job.id);
                          }
                        }}
                      >
                        {t("delete")}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
