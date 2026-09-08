import { afterEach, describe, expect, it, vi } from "vitest";
import { changePassword, login, logout, me, register } from "./auth";

function ok(body: unknown) {
  return { ok: true, status: 200, json: () => Promise.resolve(body) };
}

afterEach(() => vi.unstubAllGlobals());

describe("auth service", () => {
  it("register POSTs /api/auth/register with the payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ id: 1 }));
    vi.stubGlobal("fetch", fetchMock);
    await register({ name: "A", email: "a@b.com", password: "x", company_name: "C" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/auth/register");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toMatchObject({ email: "a@b.com" });
  });

  it("login POSTs /api/auth/login", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ id: 1 }));
    vi.stubGlobal("fetch", fetchMock);
    await login({ email: "a@b.com", password: "x" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/auth/login");
    expect(init.method).toBe("POST");
  });

  it("me GETs /api/auth/me", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ id: 1 }));
    vi.stubGlobal("fetch", fetchMock);
    await me();
    expect(fetchMock.mock.calls[0][0]).toBe("/api/auth/me");
  });

  it("logout POSTs /api/auth/logout", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    await logout();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/auth/logout");
    expect(init.method).toBe("POST");
  });

  it("changePassword POSTs /api/auth/change-password", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ detail: "ok" }));
    vi.stubGlobal("fetch", fetchMock);
    await changePassword({ current_password: "a", new_password: "b" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/auth/change-password");
    expect(init.method).toBe("POST");
  });
});
