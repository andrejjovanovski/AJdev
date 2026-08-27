import { NextResponse } from "next/server";
import { addFeedback } from "@/lib/server/ratings";

export async function POST(request: Request) {
  let payload: { id?: string; feedback?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const id = payload.id?.trim();
  const feedback = payload.feedback?.trim();

  if (!id || !feedback) {
    return NextResponse.json({ error: "id and feedback are required." }, { status: 422 });
  }

  try {
    const rating = await addFeedback(id, feedback);
    if (!rating) return NextResponse.json({ error: "Rating not found." }, { status: 404 });
    return NextResponse.json(rating);
  } catch (err) {
    console.error("[ratings] failed to store feedback", err);
    return NextResponse.json({ error: "Could not store the feedback." }, { status: 502 });
  }
}
