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
    const message =
      (data as { detail?: string })?.detail ??
      (data as { error?: { message?: string } })?.error?.message ??
      "Có lỗi xảy ra";
    throw new Error(message);
  }

  return data as T;
}
