import { NextResponse } from "next/server";
import { createRating } from "@/lib/server/ratings";
import type { RatingPayload } from "@/lib/types";

export async function POST(request: Request) {
  let payload: RatingPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const score = Number(payload.score);
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return NextResponse.json(
      { error: "Score must be an integer between 1 and 5." },
      { status: 422 },
    );
  }

  try {
    const rating = await createRating({ score, source: payload.source });
    return NextResponse.json(rating, { status: 201 });
  } catch (err) {
    console.error("[ratings] failed to store rating", err);
    return NextResponse.json({ error: "Could not store the rating." }, { status: 502 });
  }
}
