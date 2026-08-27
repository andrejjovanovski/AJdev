"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { sendRating, updateRatingFeedback } from "@/lib/api/actions";
import styles from "./RatingWidget.module.css";

type Stage = "rate" | "feedback" | "thanks";

const IMAGES: Record<Stage, string> = {
  rate: "/assets/rate-laptop.png",
  feedback: "/assets/rate-thinking.png",
  thanks: "/assets/rate-happy.png",
};

const STORAGE_KEY = "aj-rated";

export function RatingWidget({ delay = 3000 }: { delay?: number }) {
  const [visible, setVisible] = useState(false);
  const [stage, setStage] = useState<Stage>("rate");
  const [transitioning, setTransitioning] = useState(false);
  const [hover, setHover] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [ratingId, setRatingId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const goToStage = (next: Stage) => {
    setTransitioning(true);
    setTimeout(() => {
      setStage(next);
      setTransitioning(false);
      if (next === "thanks") setTimeout(() => setVisible(false), 2600);
    }, 450);
  };

  const selectScore = async (value: number) => {
    setScore(value);
    goToStage(value >= 4 ? "thanks" : "feedback");

    try {
      const rating = await sendRating({ score: value, source: "terminal" });
      setRatingId(rating.id);
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch (err) {
      console.error("[rating] failed to save", err);
    }
  };

  const submitFeedback = async () => {
    setSending(true);
    try {
      if (ratingId && feedback.trim()) await updateRatingFeedback(ratingId, feedback.trim());
    } catch (err) {
      console.error("[rating] failed to save feedback", err);
    } finally {
      setSending(false);
      goToStage("thanks");
    }
  };

  return (
    <div className={`${styles.wrap} ${visible ? styles.visible : ""}`} aria-hidden={!visible}>
      <div className={`${styles.bubble} ${transitioning ? styles.transitioning : ""}`}>
        {stage === "rate" && (
          <>
            <div className={styles.heading}>How was your experience?</div>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`${styles.star} ${n <= (hover || score) ? styles.starActive : ""}`}
                  onClick={() => selectScore(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  aria-label={`Rate ${n} out of 5`}
                >
                  ★
                </button>
              ))}
            </div>
          </>
        )}

        {stage === "feedback" && (
          <>
            <div className={styles.subhead}>Sorry to hear that — what went wrong?</div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              placeholder="Tell us what to improve..."
              className={styles.textarea}
            />
            <button
              type="button"
              onClick={submitFeedback}
              disabled={sending}
              className={styles.send}
            >
              {sending ? "Sending..." : "Send Feedback"}
            </button>
          </>
        )}

        {stage === "thanks" && <div className={styles.heading}>Thank you for the feedback! 🎉</div>}
      </div>

      <div className={styles.imageWrap}>
        {(Object.keys(IMAGES) as Stage[]).map((name) => (
          <Image
            key={name}
            src={IMAGES[name]}
            alt=""
            width={130}
            height={130}
            className={`${styles.image} ${stage === name && !transitioning ? styles.imageActive : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
