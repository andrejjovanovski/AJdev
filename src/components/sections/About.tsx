import { Icon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { AboutCard } from "@/lib/types";
import styles from "./About.module.css";

export function About({ cards }: { cards: AboutCard[] }) {
  return (
    <section id="about" className={styles.section}>
      <div className={styles.grid}>
        <Reveal>
          <SectionHeading eyebrow="05 — ABOUT" title="More than just code." align="left" />
          <p className={styles.copy}>
            I enjoy building complete products — backend systems, APIs, database design and the
            frontend that ties it together. I like owning a problem end to end, not just the parts
            that are fun.
          </p>
        </Reveal>

        <div className={styles.cards}>
          {cards.map((card) => (
            <div key={card.label} className={styles.card}>
              <Icon name={card.icon} size={56} className={styles.watermark} />
              <div className={styles.label}>{card.label}</div>
              <div className={styles.value}>{card.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
