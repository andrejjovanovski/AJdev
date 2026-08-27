"use client";

import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/lib/hooks";
import styles from "./CustomCursor.module.css";

export function CustomCursor() {
  const finePointer = useMediaQuery("(pointer: fine)");
  const ref = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (!finePointer) return;

    document.body.classList.add(styles.hideNative);

    const onMove = (e: MouseEvent) => {
      if (ref.current) {
        ref.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
      const target = e.target as HTMLElement | null;
      setHovering(Boolean(target?.closest("a, button, input, textarea, [data-cursor-hover]")));
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.body.classList.remove(styles.hideNative);
    };
  }, [finePointer]);

  if (!finePointer) return null;

  return <div ref={ref} className={`${styles.cursor} ${hovering ? styles.hovering : ""}`} />;
}
