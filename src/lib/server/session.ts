/**
 * Portal session cookie — a payload signed with HMAC-SHA256.
 *
 * Uses Web Crypto only, so the exact same code runs in middleware (edge
 * runtime), route handlers and server components. Fails closed: without
 * PORTAL_SESSION_SECRET nothing verifies and nothing can be signed.
 */

export const SESSION_COOKIE = "aj_portal_session";

/** Fallback lifetime if the backend token carries no usable `exp`. */
export const SESSION_MAX_AGE = 60 * 60 * 24;

/** What the portal login route hands us after authenticating against the backend. */
export type SessionInput = {
  email: string;
  accessToken: string;
  refreshToken: string;
  userId: string;
};

export type Session = SessionInput & { exp: number };

const encoder = new TextEncoder();

/** Best-effort read of a JWT's payload — no signature check (the backend owns that). */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function secret(): string | null {
  const value = process.env.PORTAL_SESSION_SECRET ?? "";
  return value.length >= 16 ? value : null;
}

export const hasSessionSecret = () => secret() !== null;

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "="));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function key(rawSecret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(rawSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Seconds since epoch when the cookie should expire — mirrors the backend token. */
function sessionExpiry(accessToken: string): number {
  const now = Math.floor(Date.now() / 1000);
  const claimed = decodeJwtPayload(accessToken)?.exp;
  return typeof claimed === "number" && claimed > now ? claimed : now + SESSION_MAX_AGE;
}

export async function createSessionToken(input: SessionInput): Promise<string | null> {
  const rawSecret = secret();
  if (!rawSecret) return null;

  const session: Session = { ...input, exp: sessionExpiry(input.accessToken) };
  const payload = toBase64Url(encoder.encode(JSON.stringify(session)));
  const signature = await crypto.subtle.sign("HMAC", await key(rawSecret), encoder.encode(payload));

  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token: string | undefined): Promise<Session | null> {
  const rawSecret = secret();
  if (!rawSecret || !token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  let valid: boolean;
  try {
    valid = await crypto.subtle.verify(
      "HMAC",
      await key(rawSecret),
      fromBase64Url(signature),
      encoder.encode(payload),
    );
  } catch {
    return null;
  }
  if (!valid) return null;

  try {
    const session = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as Session;
    if (typeof session.email !== "string" || typeof session.exp !== "number") return null;
    if (typeof session.accessToken !== "string" || !session.accessToken) return null;
    if (session.exp * 1000 < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
} as const;
