export const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

export const hasBackend = BASE_URL.length > 0;

/**
 * Backend entities store server-relative asset paths (e.g. `/images/projects/x.png`)
 * that are served by the API host, not by Next. Resolve them against the backend
 * origin; leave absolute URLs and empty values untouched.
 */
export const resolveAsset = (path: string | null | undefined): string | undefined => {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/") && BASE_URL) return `${BASE_URL}${path}`;
  return path;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = RequestInit & {
  revalidate?: number;
  /** Skip the backend base URL and hit this app's own route handlers. */
  local?: boolean;
};

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { revalidate, local, headers, ...init } = options;

  const res = await fetch(`${local ? "" : BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...headers },
    ...(revalidate !== undefined ? { next: { revalidate } } : {}),
  });

  if (!res.ok) {
    const body = await res.text();
    let message = body || res.statusText;
    try {
      const parsed = JSON.parse(body);
      // Route handlers answer with { error }; surface that rather than raw JSON.
      if (parsed && typeof parsed.error === "string") message = parsed.error;
    } catch {
      // Not JSON — the text body is the best message available.
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const get = <T>(path: string, revalidate = 300) => request<T>(path, { revalidate });

export const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body) });

export const postLocal = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body), local: true });
