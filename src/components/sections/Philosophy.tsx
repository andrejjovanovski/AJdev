import { Reveal } from "@/components/ui/Reveal";
import styles from "./Philosophy.module.css";

export function Philosophy() {
  return (
    <section id="philosophy" className={styles.section}>
      <Reveal>
        <div className={styles.inner}>
          <h2 className={styles.title}>Good software isn&apos;t just code that works.</h2>
          <p className={styles.subtitle}>
            It&apos;s code that&apos;s understandable, maintainable, and solves the right problem.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
