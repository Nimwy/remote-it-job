import { afterEach, describe, expect, it, vi } from "vitest";
import { getJob, listJobs } from "./jobs";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("jobs service", () => {
  it("listJobs calls /api/jobs with query params", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ items: [], page: 1, page_size: 20, total: 0, total_pages: 0 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await listJobs({ q: "react", page: 1 });

    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("/api/jobs");
    expect(url).toContain("q=react");
    expect(url).toContain("page=1");
  });

  it("getJob calls /api/jobs/:id", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: 1, title: "Job", slug: "job" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await getJob(1);

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/jobs/1");
  });
});
