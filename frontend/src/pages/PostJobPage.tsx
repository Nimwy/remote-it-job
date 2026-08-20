import { useNavigate } from 'react-router-dom'
import { JobForm, type JobFormData } from '../components/JobForm'
import { useCreateJob } from '../hooks/useHr'

export function PostJobPage() {
  const createJob = useCreateJob()
  const navigate = useNavigate()

  const onSubmit = async (data: JobFormData) => {
    const job = await createJob.mutateAsync({
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
    })
    navigate('/hr', { state: { created: job.id } })
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="mb-2 font-display text-headline-lg">Đăng tin tuyển dụng mới</h1>
      <p className="mb-6 text-body-md text-secondary">
        Tin đăng sẽ được gửi Admin duyệt trước khi công khai.
      </p>
      <JobForm onSubmit={onSubmit} submitLabel="Lưu nháp" />
    </div>
  )
}
