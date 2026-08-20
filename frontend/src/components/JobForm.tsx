import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCategories, useTags } from '../hooks/useJobs'
import type { HrJob } from '../types'
import { Button } from './ui/Button'

const schema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề'),
  category_id: z.number().min(1, 'Chọn category'),
  job_type: z.enum(['fulltime', 'parttime', 'freelance', 'contract']),
  location: z.string().optional(),
  timezone: z.string().optional(),
  salary_min: z.number().nullable().optional(),
  salary_max: z.number().nullable().optional(),
  currency: z.string().optional(),
  description: z.string().min(1, 'Vui lòng nhập mô tả'),
  requirements: z.string().min(1, 'Vui lòng nhập yêu cầu'),
  tag_ids: z.array(z.number()),
})

export type JobFormData = z.infer<typeof schema>

interface JobFormProps {
  initialValues?: HrJob
  onSubmit: (data: JobFormData) => Promise<void>
  submitLabel: string
}

const inputClass =
  'w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-md focus:border-primary focus:outline-none'

export function JobForm({ initialValues, onSubmit, submitLabel }: JobFormProps) {
  const { data: categories } = useCategories()
  const { data: tags } = useTags()

  const defaultTags = initialValues
    ? (tags ?? [])
        .filter((t) => initialValues.tags.includes(t.name))
        .map((t) => t.id)
    : []

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialValues
      ? {
          title: initialValues.title,
          category_id: initialValues.category.id,
          job_type: initialValues.job_type,
          location: initialValues.location ?? '',
          timezone: initialValues.timezone ?? '',
          salary_min: initialValues.salary_min ?? null,
          salary_max: initialValues.salary_max ?? null,
          currency: initialValues.currency ?? '',
          description: initialValues.description,
          requirements: initialValues.requirements,
          tag_ids: defaultTags,
        }
      : {
          job_type: 'fulltime',
          tag_ids: [],
        },
  })

  const selectedTags = watch('tag_ids') ?? []

  const toggleTag = (id: number) => {
    if (selectedTags.includes(id)) {
      setValue('tag_ids', selectedTags.filter((t) => t !== id))
    } else {
      setValue('tag_ids', [...selectedTags, id])
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <h2 className="mb-4 font-display text-headline-sm">Thông tin cơ bản</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-label-sm text-secondary">Tiêu đề *</label>
            <input {...register('title')} className={inputClass} />
            {errors.title && <p className="mt-1 text-body-sm text-error">{errors.title.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-label-sm text-secondary">Category *</label>
            <select {...register('category_id', { valueAsNumber: true })} className={inputClass}>
              <option value={0}>Chọn category</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="mt-1 text-body-sm text-error">{errors.category_id.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-label-sm text-secondary">Loại công việc *</label>
            <select {...register('job_type')} className={inputClass}>
              <option value="fulltime">Toàn thời gian</option>
              <option value="parttime">Bán thời gian</option>
              <option value="freelance">Freelance</option>
              <option value="contract">Hợp đồng</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-label-sm text-secondary">Địa điểm</label>
            <input {...register('location')} className={inputClass} placeholder="Việt Nam, Remote..." />
          </div>
          <div>
            <label className="mb-1 block text-label-sm text-secondary">Múi giờ</label>
            <input {...register('timezone')} className={inputClass} placeholder="UTC+7" />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <h2 className="mb-4 font-display text-headline-sm">Mức lương</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-label-sm text-secondary">Lương từ</label>
            <input
              type="number"
              {...register('salary_min', { setValueAs: (v) => (v === '' ? null : Number(v)) })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-label-sm text-secondary">Lương đến</label>
            <input
              type="number"
              {...register('salary_max', { setValueAs: (v) => (v === '' ? null : Number(v)) })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-label-sm text-secondary">Đơn vị</label>
            <select {...register('currency')} className={inputClass}>
              <option value="USD">USD</option>
              <option value="VND">VND</option>
              <option value="EUR">EUR</option>
              <option value="SGD">SGD</option>
              <option value="JPY">JPY</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <h2 className="mb-4 font-display text-headline-sm">Chi tiết công việc</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-label-sm text-secondary">Mô tả *</label>
            <textarea rows={5} {...register('description')} className={inputClass} />
            {errors.description && (
              <p className="mt-1 text-body-sm text-error">{errors.description.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-label-sm text-secondary">Yêu cầu *</label>
            <textarea rows={5} {...register('requirements')} className={inputClass} />
            {errors.requirements && (
              <p className="mt-1 text-body-sm text-error">{errors.requirements.message}</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <h2 className="mb-4 font-display text-headline-sm">Công nghệ / Kỹ năng</h2>
        <div className="flex flex-wrap gap-2">
          {tags?.map((tag) => (
            <button
              type="button"
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`rounded-full px-3 py-1.5 text-body-sm transition-colors ${
                selectedTags.includes(tag.id)
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-secondary hover:bg-surface-container'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}
