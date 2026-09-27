"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { HeroTerminal } from "@/components/terminal/HeroTerminal";
import { scrollToSection } from "@/lib/hooks";
import { fadeUp, staggerContainer } from "@/lib/motion";
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
        <motion.div initial="hidden" animate="visible" variants={staggerContainer(0.1, 0.1)}>
          <motion.div className={styles.badge} variants={fadeUp}>
            <span className={styles.dot} />
            Available for opportunities
          </motion.div>
          <motion.h1 className={styles.name} variants={fadeUp}>
            {personal.name}
          </motion.h1>
          <motion.div className={styles.role} variants={fadeUp}>
            {personal.role}
          </motion.div>
          <motion.p className={styles.lead} variants={fadeUp}>
            Software Engineer building full-stack applications, APIs and digital products.
          </motion.p>
          <motion.p className={styles.sub} variants={fadeUp}>
            I turn ideas into production-ready software — from backend architecture and databases to
            polished user experiences.
          </motion.p>
          <motion.div className={styles.actions} variants={fadeUp}>
            <motion.button
              type="button"
              className={styles.primary}
              onClick={() => scrollToSection("projects")}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.96 }}
            >
              View My Work
            </motion.button>
            <motion.a
              href={personal.github}
              target="_blank"
              rel="noreferrer"
              className={styles.secondary}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.96 }}
            >
              GitHub
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        >
          <div className={styles.visual}>
            <HeroTerminal personal={personal} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
