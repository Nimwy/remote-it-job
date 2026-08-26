"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useLogout, useMe } from "../hooks/useAuth";
import { Icon } from "./ui/Icon";
import { Button } from "./ui/Button";
import { LanguageSwitcher } from "./LanguageSwitcher";

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 text-label-md transition-colors ${
        active
          ? "border-b-2 border-primary text-primary"
          : "text-secondary hover:text-primary"
      }`}
    >
      {label}
    </Link>
  );
}

function MobileNavLink({
  href,
  label,
  active,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block rounded-lg px-4 py-2.5 text-label-md transition-colors ${
        active ? "bg-primary-container text-on-primary-container" : "text-on-surface hover:bg-surface-container-low"
      }`}
    >
      {label}
    </Link>
  );
}

export function NavBar() {
  const t = useTranslations("nav");
  const { data: user, isLoading } = useMe();
  const logout = useLogout();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    setMobileOpen(false);
    await logout.mutateAsync();
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(query.trim() ? `/jobs?q=${encodeURIComponent(query.trim())}` : "/jobs");
  };

  const activeJobs = pathname.startsWith("/jobs");
  const activeHr = pathname.startsWith("/hr");
  const activeAdmin = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface shadow-sm">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Icon name="work" fill className="text-primary" />
            <span className="font-display text-headline-sm font-bold tracking-tight text-primary">
              Remote IT
            </span>
          </Link>

          <nav className="hidden items-center gap-4 md:flex">
            <NavLink href="/jobs" label={t("findJobs")} active={activeJobs} />
            {user?.role === "hr" && (
              <NavLink href="/hr" label={t("dashboard")} active={activeHr} />
            )}
            {user?.role === "admin" && (
              <NavLink href="/admin" label={t("admin")} active={activeAdmin} />
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative hidden w-64 md:block">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container pl-10 pr-4 text-body-sm placeholder:text-outline-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </form>

          {!isLoading && !user && (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button variant="outline">{t("login")}</Button>
              </Link>
              <Link href="/register" className="hidden sm:block">
                <Button>
                  <Icon name="add" className="text-[18px]" />
                  {t("postJob")}
                </Button>
              </Link>
              <Link href="/register" className="sm:hidden">
                <Button>
                  <Icon name="add" className="text-[18px]" />
                </Button>
              </Link>
            </>
          )}
          {!isLoading && user?.role === "hr" && (
            <>
              <Link href="/hr/jobs/new" className="hidden md:block">
                <Button>
                  <Icon name="add" className="text-[18px]" />
                  {t("postJob")}
                </Button>
              </Link>
              <button
                onClick={handleLogout}
                className="hidden text-label-md text-secondary hover:text-primary md:block"
              >
                {t("logout")}
              </button>
            </>
          )}
          {!isLoading && user?.role === "admin" && (
            <button
              onClick={handleLogout}
              className="hidden text-label-md text-secondary hover:text-primary md:block"
            >
              {t("logout")}
            </button>
          )}

          <LanguageSwitcher />

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface hover:bg-surface-container-low md:hidden"
          >
            <Icon name={mobileOpen ? "close" : "menu"} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-outline-variant bg-surface px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <MobileNavLink href="/jobs" label={t("findJobs")} active={activeJobs} onClick={() => setMobileOpen(false)} />
            {user?.role === "hr" && (
              <>
                <MobileNavLink href="/hr" label={t("dashboard")} active={activeHr} onClick={() => setMobileOpen(false)} />
                <MobileNavLink href="/hr/jobs/new" label={t("postJob")} active={false} onClick={() => setMobileOpen(false)} />
                <MobileNavLink href="/hr/profile" label={t("profile")} active={pathname.startsWith("/hr/profile")} onClick={() => setMobileOpen(false)} />
              </>
            )}
            {user?.role === "admin" && (
              <MobileNavLink href="/admin" label={t("admin")} active={activeAdmin} onClick={() => setMobileOpen(false)} />
            )}
            {!user && (
              <>
                <MobileNavLink href="/login" label={t("login")} active={false} onClick={() => setMobileOpen(false)} />
                <MobileNavLink href="/register" label={t("postJob")} active={false} onClick={() => setMobileOpen(false)} />
              </>
            )}
            {user && (
              <button
                onClick={handleLogout}
                className="rounded-lg px-4 py-2.5 text-left text-label-md text-on-surface hover:bg-surface-container-low"
              >
                {t("logout")}
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
