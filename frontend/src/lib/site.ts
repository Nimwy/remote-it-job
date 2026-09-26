import { routing, type Locale } from "@/i18n/routing";

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

export function alternates(locale: Locale, path: string) {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = absUrl(l, path);
  }
  languages["x-default"] = absUrl(routing.defaultLocale, path);
  return {
    canonical: absUrl(locale, path),
    languages,
  };
}
