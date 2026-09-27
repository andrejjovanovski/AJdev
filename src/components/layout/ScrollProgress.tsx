"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import styles from "./ScrollProgress.module.css";

/**
 * Tracks scroll through motion values rather than React state, so scrolling
 * doesn't re-render the page on every frame.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 300, damping: 40, mass: 0.5 });

  return (
    <div className={styles.track}>
      <motion.div className={styles.bar} style={{ scaleX }} />
    </div>
  );
}
