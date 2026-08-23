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
  it("returns 'no deadline' when expires_at is null", () => {
    expect(timeLeft(null, "vi")).toContain("Không giới hạn");
  });

  it("returns 'expired' for past dates", () => {
    const past = new Date(Date.now() - DAY).toISOString();
    expect(timeLeft(past, "vi")).toBe("Đã hết hạn");
    expect(timeLeft(past, "en")).toBe("Expired");
  });

  it("returns remaining days", () => {
    const future = new Date(Date.now() + 28 * DAY).toISOString();
    expect(timeLeft(future, "vi")).toBe("Còn 28 ngày");
    expect(timeLeft(future, "en")).toBe("28 days left");
  });

  it("returns 'expires today' for same-day expiry", () => {
    const today = new Date(Date.now() + 6 * HOUR).toISOString();
    expect(timeLeft(today, "vi")).toBe("Hết hạn hôm nay");
  });
});
