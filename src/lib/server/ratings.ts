import { randomUUID } from "node:crypto";
import type { RatingPayload } from "@/lib/types";

export type Rating = {
  id: string;
  score: number;
  feedback?: string;
  source: string;
  createdAt: string;
};

/**
 * In-memory: the backend (AJdevBackendApi) has no ratings endpoint yet, so these
 * are not forwarded even when NEXT_PUBLIC_API_URL is set. Swap `store` for a
 * database call when ratings need to persist. Kept on globalThis so it survives
 * dev hot reloads.
 */
const globalStore = globalThis as typeof globalThis & { __ratings?: Map<string, Rating> };
const store = (globalStore.__ratings ??= new Map<string, Rating>());

export async function createRating(payload: RatingPayload): Promise<Rating> {
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
  const rating = store.get(id);
  if (!rating) return null;

  const updated = { ...rating, feedback };
  store.set(id, updated);
  return updated;
}

export const listRatings = () => [...store.values()];
