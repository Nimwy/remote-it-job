"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useMe } from "../hooks/useAuth";

export function RequireRole({
  role,
  children,
}: {
  role: "hr" | "admin";
  children: React.ReactNode;
}) {
  const { data: user, isLoading } = useMe();
  const router = useRouter();
  const t = useTranslations("hr");

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role !== role) {
        router.replace("/");
      }
    }
  }, [isLoading, user, role, router]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-12 text-body-md text-secondary">
        {t("loading")}
      </div>
    );
  }

  if (!user || user.role !== role) {
    return null;
  }

  // HR đang pending: không cho vào dashboard (backend chặn mọi /hr/* → 403)
  if (role === "hr" && user.status === "pending") {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-12">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-outline-variant bg-surface-container-lowest py-16 text-center">
          <p className="text-body-md text-secondary">{t("pendingApproval")}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
