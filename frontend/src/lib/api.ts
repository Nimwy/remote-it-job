export class ApiError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "ApiError";
  }
}

let refreshPromise: Promise<boolean> | null = null;

/**
 * Gọi /auth/refresh MỘT lần và cho nhiều request cùng hết hạn dùng chung một
 * promise (gom lại) — không thì refresh token bị xoay đè nhau làm văng người dùng.
 */
async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        return res.ok;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

async function rawFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const code =
      (data as { error?: { code?: string } })?.error?.code ??
      (data as { code?: string })?.code ??
      "unknown_error";
    const message =
      (data as { error?: { message?: string } })?.error?.message ??
      (data as { detail?: string })?.detail ??
      "Có lỗi xảy ra";
    throw new ApiError(code, message);
  }

  return data as T;
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  try {
    return await rawFetch<T>(path, options);
  } catch (err) {
    // Access token hết hạn -> refresh một lần rồi thử lại request gốc.
    if (err instanceof ApiError && err.code === "auth.token_expired") {
      const refreshed = await refreshSession();
      if (refreshed) {
        return rawFetch<T>(path, options);
      }
    }
    throw err;
  }
}
