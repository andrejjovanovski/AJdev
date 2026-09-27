"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useMotionValue } from "framer-motion";
import { EASE } from "@/lib/motion";

export function Counter({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionValue, value, {
      duration: 1.4,
      ease: EASE,
      onUpdate: (v) => setDisplay(Math.round(v).toLocaleString("en-US")),
    });
    return () => controls.stop();
  }, [inView, value, motionValue]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
