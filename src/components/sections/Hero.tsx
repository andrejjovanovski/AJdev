"use client";

import { useRef, useState } from "react";
import { HeroTerminal } from "@/components/terminal/HeroTerminal";
import { scrollToSection } from "@/lib/hooks";
import type { Personal } from "@/lib/types";
import styles from "./Hero.module.css";

export function Hero({ personal }: { personal: Personal }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [glow, setGlow] = useState({ x: 50, y: 40 });

  const onMouseMove = (e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    setGlow({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <section id="hero" ref={sectionRef} className={styles.hero} onMouseMove={onMouseMove}>
      <div
        className={styles.glow}
        style={{
          background: `radial-gradient(600px circle at ${glow.x}% ${glow.y}%, rgba(91,127,255,0.15), transparent 60%)`,
        }}
      />
      <div className={styles.grid} />

      <div className={styles.content}>
        <div>
          <div className={styles.badge}>
            <span className={styles.dot} />
            Available for opportunities
          </div>
          <h1 className={styles.name}>{personal.name}</h1>
          <div className={styles.role}>{personal.role}</div>
          <p className={styles.lead}>
            Software Engineer building full-stack applications, APIs and digital products.
          </p>
          <p className={styles.sub}>
            I turn ideas into production-ready software — from backend architecture and databases to
            polished user experiences.
          </p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primary}
              onClick={() => scrollToSection("projects")}
            >
              View My Work
            </button>
            <a href={personal.github} target="_blank" rel="noreferrer" className={styles.secondary}>
              GitHub
            </a>
          </div>
        </div>

        <div className={styles.visual}>
          <HeroTerminal personal={personal} />
        </div>
      </div>
    </section>
  );
}
