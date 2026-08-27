import { randomUUID } from "node:crypto";
import type { RatingPayload } from "@/lib/types";

export type Rating = {
  id: string;
  score: number;
  feedback?: string;
  source: string;
  createdAt: string;
};

const BACKEND = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

/**
 * In-memory until the ratings backend exists — swap `store` for a database
 * call, or set NEXT_PUBLIC_API_URL and these forward to `/ratings` instead.
 * Kept on globalThis so it survives dev hot reloads.
 */
const globalStore = globalThis as typeof globalThis & { __ratings?: Map<string, Rating> };
const store = (globalStore.__ratings ??= new Map<string, Rating>());

export async function createRating(payload: RatingPayload): Promise<Rating> {
  if (BACKEND) {
    const res = await fetch(`${BACKEND}/ratings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`backend responded ${res.status}`);
    return res.json();
  }

  const rating: Rating = {
    id: randomUUID(),
    score: payload.score,
    source: payload.source ?? "portfolio",
    createdAt: new Date().toISOString(),
  };
  store.set(rating.id, rating);
  return rating;
}

export async function addFeedback(id: string, feedback: string): Promise<Rating | null> {
  if (BACKEND) {
    const res = await fetch(`${BACKEND}/ratings/${id}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback }),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`backend responded ${res.status}`);
    return res.json();
  }

  const rating = store.get(id);
  if (!rating) return null;

  const updated = { ...rating, feedback };
  store.set(id, updated);
  return updated;
}

export const listRatings = () => [...store.values()];
