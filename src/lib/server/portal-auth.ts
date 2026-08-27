import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken, type Session } from "./session";

/**
 * Credential check for the portal. Node-only (scrypt) — import it from route
 * handlers and server components, never from middleware.
 */

const KEY_LENGTH = 64;

/** `scrypt:<saltHex>:<hashHex>` — what PORTAL_PASSWORD_HASH holds. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEY_LENGTH);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

function equals(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  // timingSafeEqual throws on length mismatch, so compare lengths separately.
  return left.length === right.length && timingSafeEqual(left, right);
}

function matchesPassword(password: string): boolean {
  const stored = process.env.PORTAL_PASSWORD_HASH ?? "";

  if (stored.startsWith("scrypt:")) {
    const [, saltHex, hashHex] = stored.split(":");
    if (!saltHex || !hashHex) return false;
    const expected = Buffer.from(hashHex, "hex");
    const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }

  const plain = process.env.PORTAL_PASSWORD ?? "";
  return plain.length > 0 && equals(password, plain);
}

export const isPortalConfigured = () =>
  Boolean(
    process.env.PORTAL_EMAIL &&
    (process.env.PORTAL_PASSWORD_HASH || process.env.PORTAL_PASSWORD) &&
    process.env.PORTAL_SESSION_SECRET,
  );

export function verifyCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.PORTAL_EMAIL ?? "";
  if (!expectedEmail || !password) return false;

  // Both checks always run so a wrong email and a wrong password cost the same.
  const emailOk = equals(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase());
  const passwordOk = matchesPassword(password);
  return emailOk && passwordOk;
}

/** The signed-in account, or null. Read this in every portal server component. */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}
