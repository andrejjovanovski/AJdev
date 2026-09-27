"use client";

import { motion } from "framer-motion";
import styles from "./ScrollProgress.module.css";

export function ScrollProgress({ progress }: { progress: number }) {
  return (
    <div className={styles.track}>
      <motion.div
        className={styles.bar}
        animate={{ width: `${progress}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 40, mass: 0.5 }}
      />
    </div>
  );
}
