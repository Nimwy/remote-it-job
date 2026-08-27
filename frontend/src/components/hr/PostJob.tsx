"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { JobForm, type JobFormData } from "@/components/JobForm";
import { useCreateJob } from "@/hooks/useHr";
import { getApiErrorMessage } from "@/lib/errors";

export function PostJob() {
  const t = useTranslations("jobForm");
  const e = useTranslations("errors");
  const createJob = useCreateJob();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: JobFormData) => {
    setError(null);
    try {
      await createJob.mutateAsync({
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
      });
      router.push("/hr");
    } catch (err) {
      setError(getApiErrorMessage(e, err));
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="mb-2 font-display text-headline-lg">{t("postTitle")}</h1>
      <p className="mb-6 text-body-md text-secondary">{t("postSubtitle")}</p>
      {error && <p className="mb-4 text-body-sm text-error">{error}</p>}
      <JobForm onSubmit={onSubmit} submitLabel={t("saveDraft")} />
    </div>
  );
}
