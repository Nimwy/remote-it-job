import { describe, expect, it } from "vitest";
import { timeAgo, timeLeft } from "./date";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("timeAgo", () => {
  it("returns 'just now' style for recent dates (vi)", () => {
    const recent = new Date(Date.now() - 30 * 1000).toISOString();
    expect(timeAgo(recent, "vi")).toBe("vừa xong");
  });

  it("returns minutes ago (vi)", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * MINUTE).toISOString();
    expect(timeAgo(fiveMinAgo, "vi")).toContain("phút");
  });

  it("returns hours ago (en)", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * HOUR).toISOString();
    expect(timeAgo(threeHoursAgo, "en")).toContain("hour");
  });

  it("returns days ago (vi)", () => {
    const tenDaysAgo = new Date(Date.now() - 10 * DAY).toISOString();
    expect(timeAgo(tenDaysAgo, "vi")).toContain("ngày");
  });
});

describe("timeLeft", () => {
  const now = new Date("2026-01-15T00:00:00Z").getTime();

  it("returns 'no deadline' when expires_at is null", () => {
    expect(timeLeft(null, "vi", now)).toContain("Không giới hạn");
  });

  it("returns 'expired' for past dates", () => {
    const past = new Date(now - DAY).toISOString();
    expect(timeLeft(past, "vi", now)).toBe("Đã hết hạn");
    expect(timeLeft(past, "en", now)).toBe("Expired");
  });

  it("returns remaining days", () => {
    const future = new Date(now + 28 * DAY).toISOString();
    expect(timeLeft(future, "vi", now)).toBe("Còn 28 ngày");
    expect(timeLeft(future, "en", now)).toBe("28 days left");
  });

  it("returns 'expires today' for same-day expiry", () => {
    const today = new Date(now + 6 * HOUR).toISOString();
    expect(timeLeft(today, "vi", now)).toBe("Hết hạn hôm nay");
  });

  it("is stable right at a day boundary (T-05)", () => {
    const boundary = new Date(now + 28 * DAY + 1).toISOString();
    expect(timeLeft(boundary, "en", now)).toBe("28 days left");
    const underOneDay = new Date(now + HOUR).toISOString();
    expect(timeLeft(underOneDay, "en", now)).toBe("Expires today");
  });
});
