"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { JobForm, type JobFormData } from "@/components/JobForm";
import { useHrJob, useUpdateJob, useSubmitJob } from "@/hooks/useHr";
import { Button } from "@/components/ui/Button";

export function EditJob() {
  const t = useTranslations("jobForm");
  const hr = useTranslations("hr");
  const params = useParams<{ id: string }>();
  const jobId = Number(params.id);
  const { data: job, isLoading } = useHrJob(jobId);
  const updateJob = useUpdateJob();
  const submitJob = useSubmitJob();
  const router = useRouter();

  if (isLoading) {
    return <div className="mx-auto max-w-3xl px-6 py-8 text-body-md text-secondary">{hr("loading")}</div>;
  }

  if (!job) {
    return <div className="mx-auto max-w-3xl px-6 py-8 text-body-md text-secondary">{t("notFound")}</div>;
  }

  const onSubmit = async (data: JobFormData) => {
    await updateJob.mutateAsync({
      id: jobId,
      data: {
        title: data.title,
        category_id: data.category_id,
        job_type: data.job_type,
        location: data.location || null,
        timezone: data.timezone || null,
        salary_min: data.salary_min ?? null,
        salary_max: data.salary_max ?? null,
        currency: data.currency || null,
        description: data.description,
        requirements: data.requirements,
        tag_ids: data.tag_ids,
      },
    });
    router.push("/hr");
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
          <Button variant="outline" onClick={() => submitJob.mutateAsync(jobId).then(() => router.push("/hr"))}>
            {hr("submit")}
          </Button>
        )}
      </div>
      <JobForm initialValues={job} onSubmit={onSubmit} submitLabel={t("update")} />
    </div>
  );
}
