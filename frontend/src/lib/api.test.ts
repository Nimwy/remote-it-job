// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "./api";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("apiFetch refresh handling", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("refreshes once then retries the original request", async () => {
    let jobsCalls = 0;
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/auth/refresh")) {
        return new Response(null, { status: 200 });
      }
      jobsCalls += 1;
      if (jobsCalls === 1) {
        return jsonResponse({ error: { code: "auth.token_expired", message: "expired" } }, 401);
      }
      return jsonResponse({ ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    const data = await apiFetch<{ ok: true }>("/jobs");

    expect(data.ok).toBe(true);
    expect(jobsCalls).toBe(2);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("dedups concurrent refreshes into a single call", async () => {
    let refreshCalls = 0;
    let jobsCalls = 0;
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/auth/refresh")) {
        refreshCalls += 1;
        await new Promise((r) => setTimeout(r, 10));
        return new Response(null, { status: 200 });
      }
      jobsCalls += 1;
      if (jobsCalls <= 2) {
        return jsonResponse({ error: { code: "auth.token_expired", message: "expired" } }, 401);
      }
      return jsonResponse({ ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    const [a, b] = await Promise.all([
      apiFetch<{ ok: true }>("/jobs"),
      apiFetch<{ ok: true }>("/jobs"),
    ]);

    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
    expect(refreshCalls).toBe(1);
  });
});
