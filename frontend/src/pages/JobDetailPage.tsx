import { Link, useParams } from 'react-router-dom'
import { useJob } from '../hooks/useJobs'
import { CONTACT_LABELS, JOB_TYPE_LABELS } from '../types'
import { Icon } from '../components/ui/Icon'

const contactIcons: Record<string, string> = {
  zalo: 'chat',
  telegram: 'send',
  linkedin: 'work',
  phone: 'call',
  email: 'mail',
}

export function JobDetailPage() {
  const { id } = useParams()
  const { data: job, isLoading } = useJob(Number(id))

  if (isLoading) {
    return <div className="mx-auto max-w-container px-6 py-8 text-body-md text-secondary">Đang tải...</div>
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-container px-6 py-8">
        <p className="text-body-md text-secondary">Không tìm thấy tin tuyển dụng.</p>
      </div>
    )
  }

  const salary =
    job.salary_min || job.salary_max
      ? `${job.salary_min ?? '?'} - ${job.salary_max ?? '?'} ${job.currency ?? ''}`.trim()
      : 'Thỏa thuận'

  return (
    <div className="mx-auto max-w-container px-6 py-8">
      <Link to="/jobs" className="mb-6 inline-block text-body-md text-secondary hover:text-primary">
        ← Quay lại danh sách
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-headline-lg text-on-surface">{job.title}</h1>
                <p className="mt-1 text-headline-sm text-secondary">{job.company_name}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-headline-md text-primary">{salary}</p>
                <p className="text-body-sm text-secondary">Thanh toán hàng tháng</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {job.location && (
                <span className="flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 text-label-sm text-secondary">
                  <Icon name="location_on" className="text-[16px]" />
                  {job.location}
                </span>
              )}
              <span className="flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 text-label-sm text-secondary">
                <Icon name="schedule" className="text-[16px]" />
                {JOB_TYPE_LABELS[job.job_type] ?? job.job_type}
              </span>
              <span className="rounded-full bg-tertiary-fixed px-3 py-1 text-label-sm uppercase text-on-surface">
                Remote 100%
              </span>
            </div>
          </section>

          <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
            <h2 className="mb-3 font-display text-headline-md">Mô tả công việc</h2>
            <p className="whitespace-pre-wrap text-body-md text-on-surface-variant">{job.description}</p>
          </section>

          <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
            <h2 className="mb-3 font-display text-headline-md">Yêu cầu kỹ năng</h2>
            <p className="whitespace-pre-wrap text-body-md text-on-surface-variant">{job.requirements}</p>
          </section>

          {job.tags.length > 0 && (
            <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
              <h2 className="mb-3 font-display text-headline-md">Công nghệ</h2>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-surface-container-high px-3 py-1 font-mono text-body-sm text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="lg:col-span-1">
          <section className="sticky top-24 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
            <h2 className="border-b border-outline-variant pb-3 font-display text-headline-sm">
              Liên hệ ứng tuyển
            </h2>
            {job.contacts.length > 0 ? (
              <div className="mt-4 space-y-3">
                {job.contacts.map((contact) => (
                  <a
                    key={contact.channel}
                    href={
                      contact.channel === 'email'
                        ? `mailto:${contact.value}`
                        : contact.channel === 'phone'
                          ? `tel:${contact.value}`
                          : undefined
                    }
                    className="flex items-center gap-3 text-body-md text-secondary hover:text-primary"
                  >
                    <Icon name={contactIcons[contact.channel] ?? 'link'} className="text-[20px]" />
                    <span>{CONTACT_LABELS[contact.channel] ?? contact.channel}</span>
                    <span className="ml-auto truncate text-body-sm">{contact.value}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-body-sm text-secondary">HR chưa cung cấp thông tin liên hệ.</p>
            )}
            <div className="mt-6 rounded-lg border border-error-container/50 bg-error-container/30 p-3 text-body-sm text-on-error-container">
              Job seeker tự liên hệ trực tiếp với HR, không nộp CV qua hệ thống.
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
