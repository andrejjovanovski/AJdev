import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TagList } from "@/components/ui/Tag";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import type { Job } from "@/lib/types";
import styles from "./Experience.module.css";

export function Experience({ jobs }: { jobs: Job[] }) {
  return (
    <section id="experience" className={styles.section}>
      <div className={styles.container}>
        <SectionHeading eyebrow="04 — EXPERIENCE" title="Where I've worked." />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer(0.15)}
        >
          {jobs.map((job) => (
            <motion.div
              key={`${job.company}-${job.dates}`}
              className={styles.item}
              variants={fadeUp}
            >
              <motion.span
                className={styles.markerPulse}
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 1.9, opacity: 0 }}
                transition={{ duration: 1.8, ease: "easeOut", repeat: Infinity }}
              />
              <motion.span
                className={styles.marker}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={viewportOnce}
                transition={{ duration: 0.4, ease: "backOut", delay: 0.2 }}
              />
              <div className={styles.meta}>
                {job.dates} · {job.location}
              </div>
              <div className={styles.titleRow}>
                <h3 className={styles.role}>{job.role}</h3>
                <span className={styles.company}>@ {job.company}</span>
              </div>
              <div className={styles.achievements}>
                {job.achievements.map((achievement) => (
                  <div key={achievement} className={styles.achievement}>
                    <span className={styles.bullet}>▸</span>
                    {achievement}
                  </div>
                ))}
              </div>
              <TagList items={job.tech} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
