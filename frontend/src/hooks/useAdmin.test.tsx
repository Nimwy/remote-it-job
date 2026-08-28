// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { listAllJobs } = vi.hoisted(() => ({
  listAllJobs: vi.fn(),
}));

vi.mock("../services/admin", () => ({
  listAllJobs: (params: unknown) => listAllJobs(params),
}));

import { useAdminJobs } from "./useAdmin";

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("useAdminJobs", () => {
  beforeEach(() => {
    listAllJobs.mockResolvedValue({ items: [], total: 0, page: 1, page_size: 10 });
  });
  afterEach(() => vi.clearAllMocks());

  it("fetches data and exposes it on success", async () => {
    const { result } = renderHook(() => useAdminJobs({ page: 1 }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(listAllJobs).toHaveBeenCalledWith({ page: 1 });
    expect(result.current.data).toEqual({ items: [], total: 0, page: 1, page_size: 10 });
  });

  it("surfaces an error state when the request fails", async () => {
    listAllJobs.mockRejectedValueOnce(new Error("boom"));
    const { result } = renderHook(() => useAdminJobs({ page: 2 }), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
