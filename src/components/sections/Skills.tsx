import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import type { SkillGroup } from "@/lib/types";
import styles from "./Skills.module.css";

export function Skills({ skills }: { skills: SkillGroup[] }) {
  return (
    <section id="skills" className={styles.section}>
      <div className={styles.container}>
        <SectionHeading eyebrow="02 — TECHNICAL EXPERTISE" title="Tools of the trade." />

        <motion.div
          className={styles.grid}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer(0.1)}
        >
          {skills.map((group) => (
            <motion.div
              key={group.category}
              className={styles.card}
              variants={fadeUp}
              whileHover={{ y: -5 }}
            >
              <div className={styles.category}>{group.category}</div>
              <div className={styles.items}>
                {group.items.map((item) => (
                  <motion.span
                    key={item}
                    className={styles.skill}
                    whileHover={{ y: -3, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
