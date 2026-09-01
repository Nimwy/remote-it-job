"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAdminHrs, useAdminHrAction } from "@/hooks/useAdmin";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function AdminUsers() {
  const t = useTranslations("admin");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminHrs({ page });
  const action = useAdminHrAction();

  if (isLoading) {
    return <div className="text-body-md text-secondary">{t("loading")}</div>;
  }

  const hrs = data?.items ?? [];
  const totalPages = data?.total_pages ?? 0;

  return (
    <div>
      <h1 className="mb-6 font-display text-headline-lg">{t("manageHrTitle")}</h1>

      {hrs.length === 0 ? (
        <p className="text-body-md text-secondary">{t("noHr")}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
          <table className="w-full text-left">
            <thead className="border-b border-outline-variant text-label-sm text-secondary">
              <tr>
                <th className="p-4">{t("name")}</th>
                <th className="p-4">{t("email")}</th>
                <th className="p-4">{t("company")}</th>
                <th className="p-4">{t("status")}</th>
                <th className="p-4">{t("jobCount")}</th>
                <th className="p-4">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {hrs.map((hr) => (
                <tr key={hr.id} className="hover:bg-surface-container-low">
                  <td className="p-4 font-medium">{hr.name}</td>
                  <td className="p-4 text-body-md">{hr.email}</td>
                  <td className="p-4 text-body-md">{hr.company_name ?? "-"}</td>
                  <td className="p-4">
                    <Badge status={hr.status}>{hr.status}</Badge>
                  </td>
                  <td className="p-4 text-body-md">{hr.job_count}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {hr.status === "pending" && (
                        <Button onClick={() => action.mutate({ action: "approve", id: hr.id })}>
                          {t("approveHr")}
                        </Button>
                      )}
                      {hr.status === "active" && (
                        <Button variant="danger" onClick={() => action.mutate({ action: "block", id: hr.id })}>
                          {t("block")}
                        </Button>
                      )}
                      {hr.status === "blocked" && (
                        <Button variant="outline" onClick={() => action.mutate({ action: "unblock", id: hr.id })}>
                          {t("unblock")}
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
