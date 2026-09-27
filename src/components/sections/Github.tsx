import { motion } from "framer-motion";
import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import type { GithubStats, Personal } from "@/lib/types";
import styles from "./Github.module.css";

export function Github({ stats, personal }: { stats: GithubStats; personal: Personal }) {
  return (
    <section id="github" className={styles.section}>
      <div className={styles.container}>
        <SectionHeading eyebrow="06 — OPEN SOURCE" title="Building in public." />

        <Reveal>
          <div className={styles.panel}>
            <div className={styles.stats}>
              <Stat value={stats.totalRepos} label="repositories" />
              <Stat value={stats.totalContributions} label="contributions" />
              <Stat value={stats.streak} label="day streak" />
            </div>

            <motion.div
              className={styles.repos}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={staggerContainer(0.08)}
            >
              {stats.recent.map((repo) => (
                <motion.a
                  key={repo.name}
                  href={`${personal.github}/${repo.name}`}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.repo}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={styles.repoName}>{repo.name}</div>
                  <div className={styles.repoDesc}>{repo.desc}</div>
                  <div className={styles.repoLang}>● {repo.lang}</div>
                </motion.a>
              ))}
            </motion.div>

            <div className={styles.footer}>
              <a href={personal.github} target="_blank" rel="noreferrer" className={styles.profile}>
                View GitHub Profile →
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className={styles.statValue}>
        <Counter value={value} />
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}
