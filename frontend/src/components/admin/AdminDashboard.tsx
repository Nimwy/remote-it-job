"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAdminPendingJobs, useAdminHrs, useAdminJobs } from "@/hooks/useAdmin";
import { Icon } from "@/components/ui/Icon";

function StatCard({
  label,
  value,
  note,
  icon,
  highlight = false,
}: {
  label: string;
  value: number;
  note: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-card-hover ${
        highlight ? "border-tertiary bg-tertiary-container" : "border-outline-variant bg-surface-container-lowest"
      }`}
    >
      <div className={`absolute right-0 top-0 p-4 ${highlight ? "opacity-20" : "opacity-10"}`}>
        <Icon name={icon} className="text-display" />
      </div>
      <h3 className={`mb-2 text-label-md ${highlight ? "text-on-tertiary-container" : "text-on-surface-variant"}`}>
        {label}
      </h3>
      <div className="flex items-end gap-2">
        <span className={`font-display text-display leading-none ${highlight ? "text-on-tertiary-container" : "text-primary"}`}>
          {value}
        </span>
        <span
          className={`rounded px-2 py-1 text-label-sm ${
            highlight ? "bg-tertiary/30 text-on-tertiary-container" : "bg-surface-container text-secondary"
          }`}
        >
          {note}
        </span>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const t = useTranslations("admin");
  const { data: pendingJobs } = useAdminPendingJobs();
  const { data: hrs } = useAdminHrs();
  const { data: allJobs } = useAdminJobs({});

  return (
    <div>
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-headline-lg text-on-surface">{t("overview")}</h1>
          <p className="text-body-md text-on-surface-variant">{t("overviewSubtitle")}</p>
        </div>
        <div className="flex items-center gap-2 text-label-sm text-on-surface-variant">
          <Icon name="calendar_today" className="text-sm" />
          Today
        </div>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label={t("totalHr")} value={hrs?.total ?? 0} note="HR" icon="group" />
        <StatCard label={t("totalJobs")} value={allJobs?.total ?? 0} note="Jobs" icon="work" />
        <StatCard label={t("pendingJobs")} value={pendingJobs?.total ?? 0} note={t("pendingJobs")} icon="pending_actions" highlight />
      </section>

      <section className="mb-8">
        <h2 className="mb-4 font-display text-headline-sm text-on-surface">{t("quickActions")}</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/pending"
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-label-md text-on-primary shadow-sm transition-colors hover:bg-primary-container hover:text-on-primary-container"
          >
            <Icon name="fact_check" className="text-sm" />
            {t("approveNew")}
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-6 py-2 text-label-md text-on-surface shadow-sm transition-colors hover:bg-surface-variant"
          >
            <Icon name="manage_accounts" className="text-sm" />
            {t("manageHr")}
          </Link>
          <Link
            href="/admin/jobs"
            className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-6 py-2 text-label-md text-on-surface shadow-sm transition-colors hover:bg-surface-variant"
          >
            <Icon name="work_history" className="text-sm" />
            {t("manageJobs")}
          </Link>
        </div>
      </section>
    </div>
  );
}
