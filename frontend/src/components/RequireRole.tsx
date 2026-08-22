"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
        Đang tải...
      </div>
    );
  }

  if (!user || user.role !== role) {
    return null;
  }

  return <>{children}</>;
}
