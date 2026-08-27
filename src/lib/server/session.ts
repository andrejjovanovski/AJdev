/**
 * Portal session cookie — a payload signed with HMAC-SHA256.
 *
 * Uses Web Crypto only, so the exact same code runs in middleware (edge
 * runtime), route handlers and server components. Fails closed: without
 * PORTAL_SESSION_SECRET nothing verifies and nothing can be signed.
 */

export const SESSION_COOKIE = "aj_portal_session";

/** Seven days. */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type Session = { email: string; exp: number };

const encoder = new TextEncoder();

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

export async function createSessionToken(email: string): Promise<string | null> {
  const rawSecret = secret();
  if (!rawSecret) return null;

  const session: Session = { email, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE };
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
