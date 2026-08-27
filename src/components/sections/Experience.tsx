import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TagList } from "@/components/ui/Tag";
import type { Job } from "@/lib/types";
import styles from "./Experience.module.css";

export function Experience({ jobs }: { jobs: Job[] }) {
  return (
    <section id="experience" className={styles.section}>
      <div className={styles.container}>
        <SectionHeading eyebrow="04 — EXPERIENCE" title="Where I've worked." />

        <Reveal>
          {jobs.map((job) => (
            <div key={`${job.company}-${job.dates}`} className={styles.item}>
              <span className={styles.marker} />
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
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
