import { NextResponse } from "next/server";
import { isPortalConfigured, verifyCredentials } from "@/lib/server/portal-auth";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/server/session";

/**
 * Throttles repeated failures per IP so the single portal account can't be
 * brute-forced. In-memory, like the other stores here.
 */
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

type Attempt = { count: number; firstAt: number };
const globalStore = globalThis as typeof globalThis & { __portalAttempts?: Map<string, Attempt> };
const attempts = (globalStore.__portalAttempts ??= new Map<string, Attempt>());

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function isLockedOut(key: string): boolean {
  const attempt = attempts.get(key);
  if (!attempt) return false;
  if (Date.now() - attempt.firstAt > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return attempt.count >= MAX_ATTEMPTS;
}

function recordFailure(key: string) {
  const attempt = attempts.get(key);
  if (!attempt || Date.now() - attempt.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: Date.now() });
    return;
  }
  attempt.count += 1;
}

export async function POST(request: Request) {
  if (!isPortalConfigured()) {
    console.error(
      "[portal] PORTAL_EMAIL, PORTAL_PASSWORD_HASH and PORTAL_SESSION_SECRET must be set",
    );
    return NextResponse.json({ error: "The portal is not configured." }, { status: 503 });
  }

  const key = clientKey(request);
  if (isLockedOut(key)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a few minutes." },
      { status: 429 },
    );
  }

  let payload: { email?: string; password?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = payload.email ?? "";
  const password = payload.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Enter an email and password." }, { status: 422 });
  }

  if (!verifyCredentials(email, password)) {
    recordFailure(key);
    // Deliberately vague — never reveal which half was wrong.
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const token = await createSessionToken(email.trim().toLowerCase());
  if (!token) {
    return NextResponse.json({ error: "The portal is not configured." }, { status: 503 });
  }

  attempts.delete(key);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return response;
}
