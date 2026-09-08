import { afterEach, describe, expect, it, vi } from "vitest";
import { approveHr, listAllJobs, listHrs, rejectJob } from "./admin";

function ok(body: unknown) {
  return { ok: true, status: 200, json: () => Promise.resolve(body) };
}

afterEach(() => vi.unstubAllGlobals());

describe("admin service", () => {
  it("listAllJobs skips empty params", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ items: [] }));
    vi.stubGlobal("fetch", fetchMock);
    await listAllJobs({ q: "react", status: "", page: 1 });
    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/admin/jobs?q=react&page=1");
  });

  it("rejectJob POSTs reason to /api/admin/jobs/:id/reject", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ id: 3 }));
    vi.stubGlobal("fetch", fetchMock);
    await rejectJob(3, "Thiếu thông tin");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/admin/jobs/3/reject");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ reason: "Thiếu thông tin" });
  });

  it("listHrs builds query params", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ items: [] }));
    vi.stubGlobal("fetch", fetchMock);
    await listHrs({ search: "abc", status: "pending" });
    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/admin/users?search=abc&status=pending");
  });

  it("approveHr POSTs /api/admin/users/:id/approve", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ id: 5 }));
    vi.stubGlobal("fetch", fetchMock);
    await approveHr(5);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/admin/users/5/approve");
    expect(init.method).toBe("POST");
  });
});
