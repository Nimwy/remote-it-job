"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { JobForm, type JobFormData } from "@/components/JobForm";
import { useHrJob, useUpdateJob, useSubmitJob } from "@/hooks/useHr";
import { Button } from "@/components/ui/Button";
import { type JobInput } from "@/services/hr";

export function EditJob() {
  const t = useTranslations("jobForm");
  const hr = useTranslations("hr");
  const params = useParams<{ id: string }>();
  const jobId = Number(params.id);
  const { data: job, isLoading } = useHrJob(jobId);
  const updateJob = useUpdateJob();
  const submitJob = useSubmitJob();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return <div className="mx-auto max-w-3xl px-6 py-8 text-body-md text-secondary">{hr("loading")}</div>;
  }

  if (!job) {
    return <div className="mx-auto max-w-3xl px-6 py-8 text-body-md text-secondary">{t("notFound")}</div>;
  }

  // F-02: chỉ gửi field thực sự thay đổi (dirtyFields) — tránh gửi đủ 11 field
  // khiến backend coi mọi lần sửa là substantive và gỡ job khỏi public.
  const onSubmit = async (data: JobFormData, dirtyFields: string[]) => {
    setError(null);
    const payload: Partial<JobInput> = {};
    if (dirtyFields.includes("title")) payload.title = data.title;
    if (dirtyFields.includes("category_id")) payload.category_id = data.category_id;
    if (dirtyFields.includes("job_type")) payload.job_type = data.job_type;
    if (dirtyFields.includes("location")) payload.location = data.location || null;
    if (dirtyFields.includes("timezone")) payload.timezone = data.timezone || null;
    if (dirtyFields.includes("salary_min")) payload.salary_min = data.salary_min ?? null;
    if (dirtyFields.includes("salary_max")) payload.salary_max = data.salary_max ?? null;
    if (dirtyFields.includes("currency")) payload.currency = data.currency || null;
    if (dirtyFields.includes("description")) payload.description = data.description;
    if (dirtyFields.includes("requirements")) payload.requirements = data.requirements;
    if (dirtyFields.includes("tag_ids")) payload.tag_ids = data.tag_ids;

    if (Object.keys(payload).length === 0) {
      router.push("/hr");
      return;
    }

    try {
      await updateJob.mutateAsync({ id: jobId, data: payload });
      router.push("/hr");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("notFound"));
    }
  };

  const onSubmitSubmit = async () => {
    setError(null);
    try {
      await submitJob.mutateAsync(jobId);
      router.push("/hr");
    } catch (e) {
      setError(e instanceof Error ? e.message : hr("loading"));
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-headline-lg">{t("editTitle")}</h1>
          <p className="text-body-md text-secondary">
            {t("status")}: {job.status}
          </p>
        </div>
        {(job.status === "draft" || job.status === "rejected") && (
          <Button variant="outline" onClick={onSubmitSubmit}>
            {hr("submit")}
          </Button>
        )}
      </div>
      {error && <p className="mb-4 text-body-sm text-error">{error}</p>}
      <JobForm initialValues={job} onSubmit={onSubmit} submitLabel={t("update")} />
    </div>
  );
}
