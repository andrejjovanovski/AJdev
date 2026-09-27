"use client";

import { useEffect, useState } from "react";
import styles from "./AskThinking.module.css";

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

const WORDS = [
  "thinking",
  "grepping my memories",
  "consulting the dummy data",
  "asking the rubber duck",
  "warming up both neurons",
  "pretending to be an LLM",
  "reticulating splines",
  "compiling a clever answer",
  "overthinking it",
  "checking Stack Overflow",
  "untangling the spaghetti",
  "brewing more coffee",
  "running it through the vibes",
  "definitely not googling",
];

/** Spinner plus rotating "status" words shown while /ask pretends to think. */
export function AskThinking() {
  const [frame, setFrame] = useState(0);
  // Start somewhere random so repeated questions don't all open the same way.
  const [word, setWord] = useState(() => Math.floor(Math.random() * WORDS.length));

  useEffect(() => {
    const spin = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), 80);
    const talk = setInterval(() => setWord((w) => (w + 1) % WORDS.length), 650);
    return () => {
      clearInterval(spin);
      clearInterval(talk);
    };
  }, []);

  return (
    <div className={styles.row} role="status" aria-live="polite">
      <span className={styles.spinner}>{FRAMES[frame]}</span>
      <span key={word} className={styles.word}>
        {WORDS[word]}
        <span className={styles.dots}>
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </span>
    </div>
  );
}
