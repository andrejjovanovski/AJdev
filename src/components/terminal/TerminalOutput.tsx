import type { TerminalLine } from "./types";
import { toneColor } from "./types";
import styles from "./TerminalOutput.module.css";

export function TerminalOutput({ lines }: { lines: TerminalLine[] }) {
  return (
    <>
      {lines.map((l, i) => (
        <div key={i} className={styles.line} style={{ color: toneColor[l.tone] }}>
          {l.href && l.href !== "#" ? (
            <a href={l.href} target="_blank" rel="noreferrer" className={styles.link}>
              {l.text}
            </a>
          ) : (
            l.text
          )}
        </div>
      ))}
    </>
  );
}
