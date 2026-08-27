import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/portal-auth";
import { getContent, saveContent } from "@/lib/server/portal-content";

/** The dashboard is behind middleware, but the data routes check too. */
async function requireSession() {
  const session = await getSession();
  return session ? null : NextResponse.json({ error: "Not authenticated." }, { status: 401 });
}

export async function GET() {
  const denied = await requireSession();
  if (denied) return denied;

  try {
    return NextResponse.json(await getContent());
  } catch (err) {
    console.error("[portal] loading content failed", err);
    return NextResponse.json({ error: "Could not load content." }, { status: 502 });
  }
}

export async function PUT(request: Request) {
  const denied = await requireSession();
  if (denied) return denied;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    return NextResponse.json(await saveContent(payload));
  } catch (err) {
    console.error("[portal] saving content failed", err);
    return NextResponse.json({ error: "Could not save changes." }, { status: 502 });
  }
}
