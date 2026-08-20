import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-outline-variant bg-surface-container-high">
      <div className="mx-auto flex max-w-container flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
        <div>
          <p className="font-display text-label-md text-on-surface">Remote IT</p>
          <p className="text-body-sm text-secondary">Việc làm IT remote cho developer Việt Nam</p>
        </div>
        <div className="flex gap-6 text-body-sm text-secondary">
          <Link to="/jobs" className="hover:text-primary">
            Tìm việc
          </Link>
        </div>
      </div>
    </footer>
  )
}
