import Link from "next/link";
import { Icon } from "./ui/Icon";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-outline-variant bg-surface-container-high">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
        <div className="flex items-center gap-2">
          <Icon name="work" fill className="text-primary" />
          <span className="font-display text-headline-sm text-primary">Remote IT</span>
        </div>
        <p className="text-center text-body-sm text-on-surface-variant md:text-left">
          © 2024 Remote IT. Precision for the modern developer.
        </p>
        <nav className="flex gap-6 text-label-sm text-on-surface-variant">
          <Link href="/jobs" className="underline hover:text-primary">
            Tìm việc
          </Link>
        </nav>
      </div>
    </footer>
  );
}
