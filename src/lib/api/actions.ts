import type { ContactPayload, RatingPayload } from "@/lib/types";
import { postLocal } from "./client";

/**
 * Writes always go to this app's own route handlers — they hold the Resend key
 * and forward ratings to the backend when one is configured.
 */

export type RatingResponse = { id: string; score: number; createdAt: string };

export const sendContactMessage = (payload: ContactPayload) =>
  postLocal<{ id: string }>("/api/contact", payload);

export const sendRating = (payload: RatingPayload) =>
  postLocal<RatingResponse>("/api/ratings", payload);

export const updateRatingFeedback = (id: string, feedback: string) =>
  postLocal<RatingResponse>("/api/ratings/feedback", { id, feedback });
