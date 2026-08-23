import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "./api";

function mockFetch(status: number, data: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiFetch", () => {
  it("returns data for a successful response", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { id: 1, title: "Job" }));

    const result = await apiFetch<{ id: number; title: string }>("/jobs/1");
    expect(result).toEqual({ id: 1, title: "Job" });
  });

  it("returns undefined for 204 no-content", async () => {
    vi.stubGlobal("fetch", mockFetch(204, null));

    const result = await apiFetch("/jobs/1");
    expect(result).toBeUndefined();
  });

  it("throws with detail message on error", async () => {
    vi.stubGlobal("fetch", mockFetch(404, { detail: "Không tìm thấy" }));

    await expect(apiFetch("/jobs/999")).rejects.toThrow("Không tìm thấy");
  });

  it("throws a fallback message on error without detail", async () => {
    vi.stubGlobal("fetch", mockFetch(500, {}));

    await expect(apiFetch("/jobs")).rejects.toThrow("Có lỗi xảy ra");
  });
});
