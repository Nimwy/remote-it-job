import type { ReactNode } from 'react'

const statusStyles: Record<string, string> = {
  approved: 'bg-primary-fixed/40 text-primary',
  active: 'bg-primary-fixed/40 text-primary',
  pending: 'bg-[#FFF8E1] text-[#F57F17]',
  draft: 'bg-surface-container-high text-on-surface-variant',
  rejected: 'bg-error-container text-on-error-container',
  blocked: 'bg-surface-container-high text-on-surface-variant',
  closed: 'bg-surface-container-high text-on-surface-variant',
  hidden: 'bg-surface-container-high text-on-surface-variant',
  expired: 'bg-surface-container-high text-on-surface-variant',
}

export function Badge({ status, children }: { status: string; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-label-sm uppercase ${
        statusStyles[status] ?? 'bg-surface-container-high text-on-surface-variant'
      }`}
    >
      {children}
    </span>
  )
}
