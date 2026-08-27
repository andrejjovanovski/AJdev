import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { SkillGroup } from "@/lib/types";
import styles from "./Skills.module.css";

export function Skills({ skills }: { skills: SkillGroup[] }) {
  return (
    <section id="skills" className={styles.section}>
      <div className={styles.container}>
        <SectionHeading eyebrow="02 — TECHNICAL EXPERTISE" title="Tools of the trade." />

        <Reveal>
          <div className={styles.grid}>
            {skills.map((group) => (
              <div key={group.category} className={styles.card}>
                <div className={styles.category}>{group.category}</div>
                <div className={styles.items}>
                  {group.items.map((item) => (
                    <span key={item} className={styles.skill}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
