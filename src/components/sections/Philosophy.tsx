import { motion } from "framer-motion";
import { scaleIn, viewportOnce } from "@/lib/motion";
import styles from "./Philosophy.module.css";

export function Philosophy() {
  return (
    <section id="philosophy" className={styles.section}>
      <motion.div
        className={styles.inner}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={scaleIn}
      >
        <h2 className={styles.title}>Good software isn&apos;t just code that works.</h2>
        <p className={styles.subtitle}>
          It&apos;s code that&apos;s understandable, maintainable, and solves the right problem.
        </p>
      </motion.div>
    </section>
  );
}
