import { cookies } from "next/headers";
import { BASE_URL } from "@/lib/api/client";
import {
  decodeJwtPayload,
  SESSION_COOKIE,
  verifySessionToken,
  type Session,
  type SessionInput,
} from "./session";

/**
 * Portal sign-in. Credentials are checked by the backend (AJdevBackendApi)
 * `POST /api/Auth/login`; the returned tokens are carried in the signed session
 * cookie. Import from route handlers and server components.
 */

const NAME_ID_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

/** Both keys the .NET token handler might use for the user id claim. */
function userIdFromToken(accessToken: string): string {
  const payload = decodeJwtPayload(accessToken) ?? {};
  const value = payload[NAME_ID_CLAIM] ?? payload.nameid ?? payload.sub;
  return typeof value === "string" ? value : "";
}

export const isPortalConfigured = () =>
  Boolean(BASE_URL && process.env.PORTAL_SESSION_SECRET);

/**
 * Authenticate against the backend. Returns the token bundle for the session
 * cookie, or null on bad credentials / unreachable backend.
 */
export async function loginToBackend(
  email: string,
  password: string,
): Promise<SessionInput | null> {
  if (!BASE_URL) return null;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/api/Auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email.trim(), password }),
      cache: "no-store",
    });
  } catch (err) {
    console.error("[portal] backend login request failed", err);
    return null;
  }

  if (!res.ok) return null;

  let body: { accessToken?: string; refreshToken?: string };
  try {
    body = await res.json();
  } catch {
    return null;
  }

  if (!body.accessToken || !body.refreshToken) return null;

  return {
    email: email.trim().toLowerCase(),
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    userId: userIdFromToken(body.accessToken),
  };
}

/** The signed-in session, or null. Read this in every portal server component. */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}
