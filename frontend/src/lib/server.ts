const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function serverFetch<T>(
  path: string,
  options?: { searchParams?: Record<string, string | number | undefined> },
): Promise<T> {
  const url = new URL(`${BACKEND_URL}/api${path}`);
  if (options?.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    return null as T;
  }
  return res.json();
}
