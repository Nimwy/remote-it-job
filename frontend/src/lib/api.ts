export class ApiError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
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
