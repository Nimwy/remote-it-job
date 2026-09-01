type Locale = "vi" | "en";

const relativeFormatter = {
  vi: new Intl.RelativeTimeFormat("vi", { numeric: "auto" }),
  en: new Intl.RelativeTimeFormat("en", { numeric: "auto" }),
};

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

export function timeAgo(date: string, locale: Locale = "vi"): string {
  const target = new Date(date);
  const diff = target.getTime() - Date.now();

  const abs = Math.abs(diff);
  if (abs < MINUTE_MS) {
    return locale === "vi" ? "vừa xong" : "just now";
  }
  if (abs < HOUR_MS) {
    return relativeFormatter[locale].format(Math.round(diff / MINUTE_MS), "minute");
  }
  if (abs < DAY_MS) {
    return relativeFormatter[locale].format(Math.round(diff / HOUR_MS), "hour");
  }
  if (abs < 30 * DAY_MS) {
    return relativeFormatter[locale].format(Math.round(diff / DAY_MS), "day");
  }
  return relativeFormatter[locale].format(Math.round(diff / (30 * DAY_MS)), "month");
}

export function timeLeft(expiresAt: string | null, locale: Locale = "vi", now: number = Date.now()): string {
  if (!expiresAt) {
    return locale === "vi" ? "Không giới hạn" : "No deadline";
  }

  const target = new Date(expiresAt);
  const diffMs = target.getTime() - now;

  if (diffMs <= 0) {
    return locale === "vi" ? "Đã hết hạn" : "Expired";
  }

  const days = Math.floor(diffMs / DAY_MS);
  if (days < 1) {
    return locale === "vi" ? "Hết hạn hôm nay" : "Expires today";
  }

  return locale === "vi" ? `Còn ${days} ngày` : `${days} days left`;
}
