"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const t = useTranslations("admin");

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <Button variant="outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        {t("prev")}
      </Button>
      <span className="text-body-sm text-secondary">{t("page", { page, total: totalPages })}</span>
      <Button variant="outline" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        {t("next")}
      </Button>
    </div>
  );
}
