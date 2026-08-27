"use client";

import { useEffect, useState } from "react";
import styles from "./BootLoader.module.css";

const LINES = [
  { text: "$ initializing portfolio...", color: "var(--text6)" },
  { text: "$ loading projects...", color: "var(--text6)" },
  { text: "✓ ready.", color: "var(--success)" },
];

export function BootLoader({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    LINES.forEach((_, i) => {
      if (i === 0) return;
      timers.push(setTimeout(() => setStep(i), 260 * i));
    });

    timers.push(
      setTimeout(
        () => {
          setDone(true);
          onDone();
        },
        260 * LINES.length + 320,
      ),
    );

    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className={`${styles.loader} ${done ? styles.hidden : ""}`}>
      <div className={styles.lines}>
        {LINES.slice(0, step + 1).map((l) => (
          <div key={l.text} style={{ color: l.color }} className={styles.line}>
            {l.text}
          </div>
        ))}
        <span className={styles.caret} />
      </div>
    </div>
  );
}
