"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { setSessionExpiredHandler } from "@/lib/api";

/**
 * Đăng ký điều hướng locale-aware khi phiên hết hạn (R-21).
 * `api.ts` không có router nên uỷ quyền lại cho component này.
 */
export function SessionExpiredRedirect() {
  const router = useRouter();

  useEffect(() => {
    setSessionExpiredHandler(() => router.replace("/login"));
    return () => setSessionExpiredHandler(null);
  }, [router]);

  return null;
}
