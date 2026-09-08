import { afterEach, describe, expect, it, vi } from "vitest";
import { createJob, deleteJob, getHrStats, getProfile, listMyJobs } from "./hr";

function ok(body: unknown) {
  return { ok: true, status: 200, json: () => Promise.resolve(body) };
}

afterEach(() => vi.unstubAllGlobals());

describe("hr service", () => {
  it("getProfile GETs /api/hr/profile", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ id: 1 }));
    vi.stubGlobal("fetch", fetchMock);
    await getProfile();
    expect(fetchMock.mock.calls[0][0]).toBe("/api/hr/profile");
  });

  it("listMyJobs builds query params", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ items: [] }));
    vi.stubGlobal("fetch", fetchMock);
    await listMyJobs("approved", 2, 10);
    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/hr/jobs?status=approved&page=2&page_size=10");
  });

  it("getHrStats GETs /api/hr/jobs/stats", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ total: 3 }));
    vi.stubGlobal("fetch", fetchMock);
    await getHrStats();
    expect(fetchMock.mock.calls[0][0]).toBe("/api/hr/jobs/stats");
  });

  it("createJob POSTs /api/hr/jobs with the payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ id: 9 }));
    vi.stubGlobal("fetch", fetchMock);
    await createJob({
      title: "T",
      category_id: 1,
      job_type: "fulltime",
      description: "d",
      requirements: "r",
      tag_ids: [],
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/hr/jobs");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toMatchObject({ title: "T" });
  });

  it("deleteJob DELETEs /api/hr/jobs/:id", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    await deleteJob(7);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/hr/jobs/7");
    expect(init.method).toBe("DELETE");
  });
});
