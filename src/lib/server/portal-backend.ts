import { BASE_URL } from "@/lib/api/client";
import type { Session } from "./session";

/** Raised when the backend rejects the portal's token — the caller should force re-login. */
export class PortalAuthError extends Error {
  constructor(message = "Session expired — sign in again.") {
    super(message);
    this.name = "PortalAuthError";
  }
}

export class PortalBackendError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "PortalBackendError";
  }
}

/**
 * Authenticated call to the backend on behalf of the signed-in portal user.
 * `401` becomes a `PortalAuthError`; other non-2xx become `PortalBackendError`.
 * Token refresh is not wired yet — the ~1-day session simply expires to login.
 */
export async function portalFetch(
  session: Session,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  if (!BASE_URL) throw new PortalBackendError("Backend URL is not configured.", 503);

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
      ...init.headers,
    },
    cache: "no-store",
  });

  if (res.status === 401 || res.status === 403) throw new PortalAuthError();
  return res;
}

/** `portalFetch` + JSON parse + non-2xx handling. Returns `null` for 204. */
export async function portalJson<T>(
  session: Session,
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  const res = await portalFetch(session, path, init);

  if (res.status === 204) return null;

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new PortalBackendError(body || res.statusText, res.status);
  }

  if (res.status === 201 && res.headers.get("content-length") === "0") return null;
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : null;
}
