"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import styles from "./BitmojiPeek.module.css";

export function BitmojiPeek() {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href="/terminal"
      className={`${styles.wrap} ${hovered ? styles.peeking : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Open terminal mode"
    >
      <div className={styles.bubble}>
        <div className={styles.bubbleTitle}>Psst — want to explore differently?</div>
        <div className={styles.bubbleHint}>Try Terminal Mode →</div>
      </div>
      <Image
        src="/assets/bitmoji.png"
        alt=""
        width={120}
        height={120}
        className={styles.face}
        priority={false}
      />
    </Link>
  );
}
