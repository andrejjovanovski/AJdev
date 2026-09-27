import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/portal-auth";
import { PortalAuthError, PortalBackendError } from "@/lib/server/portal-backend";
import { getContent, saveContent } from "@/lib/server/portal-content";

/** The dashboard is behind middleware, but the data routes check too. */
function fail(err: unknown, action: string) {
  if (err instanceof PortalAuthError) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
  console.error(`[portal] ${action} failed`, err);
  const status = err instanceof PortalBackendError ? 502 : 500;
  return NextResponse.json({ error: `Could not ${action}.` }, { status });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  try {
    return NextResponse.json(await getContent(session));
  } catch (err) {
    return fail(err, "load content");
  }
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    return NextResponse.json(await saveContent(session, payload));
  } catch (err) {
    return fail(err, "save changes");
  }
}
