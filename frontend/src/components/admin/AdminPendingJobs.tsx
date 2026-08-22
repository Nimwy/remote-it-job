"use client";

import { useState } from "react";
import { useAdminPendingJobs, useAdminJobAction } from "@/hooks/useAdmin";
import { JOB_TYPE_LABELS, JOB_STATUS_LABELS } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function AdminPendingJobs() {
  const { data, isLoading } = useAdminPendingJobs();
  const action = useAdminJobAction();
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  if (isLoading) {
    return <div className="text-body-md text-secondary">Đang tải...</div>;
  }

  const jobs = data?.items ?? [];

  return (
    <div>
      <h1 className="mb-2 font-display text-headline-lg">Tin chờ duyệt</h1>
      <p className="mb-6 text-body-md text-secondary">{jobs.length} yêu cầu đang chờ</p>

      {jobs.length === 0 ? (
        <p className="text-body-md text-secondary">Không có tin nào đang chờ duyệt.</p>
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
                    <Badge status={job.status}>{JOB_STATUS_LABELS[job.status]}</Badge>
                    <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-label-sm text-secondary">
                      {JOB_TYPE_LABELS[job.job_type] ?? job.job_type}
                    </span>
                    {job.location && (
                      <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-label-sm text-secondary">
                        📍 {job.location}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 space-y-1 text-body-sm text-secondary">
                    <p>
                      <strong>Mô tả:</strong> {job.description.slice(0, 120)}...
                    </p>
                    <p>
                      <strong>Yêu cầu:</strong> {job.requirements.slice(0, 120)}...
                    </p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {job.tags.map((t) => (
                      <span key={t} className="rounded-full bg-surface-container-low px-2 py-0.5 font-mono text-body-sm">
                        {t}
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
                    placeholder="Lý do từ chối..."
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
                      Xác nhận từ chối
                    </Button>
                    <Button variant="ghost" onClick={() => setRejectingId(null)}>
                      Hủy
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex gap-2">
                  <Button className="flex-1" onClick={() => action.mutate({ action: "approve", id: job.id })}>
                    Phê duyệt
                  </Button>
                  <Button variant="danger" onClick={() => setRejectingId(job.id)}>
                    Từ chối
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
