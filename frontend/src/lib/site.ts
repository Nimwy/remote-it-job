import type { Locale } from "@/i18n/routing";

export function getSiteUrl(): string {
  const fromEnv = process.env.SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  return process.env.NODE_ENV === "production"
    ? "https://devremote.cc"
    : "http://localhost:3000";
}

export function absUrl(locale: Locale, path: string): string {
  const base = getSiteUrl();
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `${base}/${locale}${clean}`;
}

/**
 * Canonical URL cho một trang. `hreflang` do middleware next-intl sinh tự động
 * (`alternateLinks`, mặc định bật) dưới dạng HTTP `Link` header — không lặp lại ở đây
 * để tránh hai bộ hreflang trùng/lệch `x-default`.
 */
export function alternates(locale: Locale, path: string) {
  return { canonical: absUrl(locale, path) };
}
