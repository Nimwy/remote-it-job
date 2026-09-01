"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useAdminPendingJobs } from "@/hooks/useAdmin";
import { useLogout } from "@/hooks/useAuth";
import { Icon } from "@/components/ui/Icon";

function SideLink({
  href,
  label,
  icon,
  active,
  badge,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 rounded-lg px-4 py-2 text-label-md transition-all ${
        active
          ? "bg-primary-container font-bold text-on-primary-container"
          : "text-on-surface-variant hover:bg-surface-variant"
      }`}
    >
      <Icon name={icon} fill={active} />
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className="rounded-full bg-error px-2 py-0.5 text-label-sm text-on-error">{badge}</span>
      )}
    </Link>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin");
  const { data: pending } = useAdminPendingJobs();
  const logout = useLogout();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen">
      <aside className="fixed left-0 top-16 z-30 flex h-[calc(100vh-4rem)] w-64 flex-col border-r border-outline-variant bg-surface-container p-4 shadow-sm">
        <div className="mb-8 flex items-center gap-4 px-2">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-variant">
            <Icon name="admin_panel_settings" className="text-[24px] text-on-surface-variant" />
          </div>
          <div>
            <h2 className="font-display text-headline-sm leading-tight text-primary">{t("portal")}</h2>
            <p className="text-label-sm text-on-surface-variant">{t("manageListings")}</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          <SideLink href="/admin" label={t("dashboard")} icon="dashboard" active={pathname === "/admin"} />
          <SideLink
            href="/admin/pending"
            label={t("pending")}
            icon="pending_actions"
            active={pathname === "/admin/pending"}
            badge={pending?.total}
          />
          <SideLink href="/admin/jobs" label={t("manageJobsNav")} icon="work_history" active={pathname === "/admin/jobs"} />
          <SideLink href="/admin/users" label={t("manageHrNav")} icon="group" active={pathname === "/admin/users"} />
          <SideLink href="/admin/catalog" label={t("catalog")} icon="category" active={pathname === "/admin/catalog"} />
        </nav>

        <div className="mt-auto flex flex-col gap-4">
          <div className="h-px w-full bg-outline-variant" />
          <Link href="/" className="flex items-center gap-4 rounded-lg px-4 py-1 text-label-md text-on-surface-variant hover:bg-surface-variant">
            <Icon name="home" className="text-sm" />
            <span>{t("home")}</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-4 rounded-lg px-4 py-1 text-label-md text-on-surface-variant hover:bg-surface-variant">
            <Icon name="logout" className="text-sm" />
            <span>{t("logout")}</span>
          </button>
        </div>
      </aside>

      <div className="ml-64 w-full max-w-[1280px] px-8 py-8">{children}</div>
    </div>
  );
}
