"use client";

import { useRouter, useParams } from "next/navigation";
import { JobForm, type JobFormData } from "@/components/JobForm";
import { useHrJob, useUpdateJob, useSubmitJob } from "@/hooks/useHr";
import { Button } from "@/components/ui/Button";

export function EditJob() {
  const params = useParams<{ id: string }>();
  const jobId = Number(params.id);
  const { data: job, isLoading } = useHrJob(jobId);
  const updateJob = useUpdateJob();
  const submitJob = useSubmitJob();
  const router = useRouter();

  if (isLoading) {
    return <div className="mx-auto max-w-3xl px-6 py-8 text-body-md text-secondary">Đang tải...</div>;
  }

  if (!job) {
    return <div className="mx-auto max-w-3xl px-6 py-8 text-body-md text-secondary">Không tìm thấy tin.</div>;
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
          <h1 className="font-display text-headline-lg">Sửa tin tuyển dụng</h1>
          <p className="text-body-md text-secondary">Trạng thái: {job.status}</p>
        </div>
        {(job.status === "draft" || job.status === "rejected") && (
          <Button variant="outline" onClick={() => submitJob.mutateAsync(jobId).then(() => router.push("/hr"))}>
            Gửi duyệt
          </Button>
        )}
      </div>
      <JobForm initialValues={job} onSubmit={onSubmit} submitLabel="Cập nhật" />
    </div>
  );
}
