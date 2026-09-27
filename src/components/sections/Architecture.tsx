"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import type { ArchitectureNode } from "@/lib/types";
import styles from "./Architecture.module.css";

export function Architecture({ nodes }: { nodes: ArchitectureNode[] }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section id="architecture" className={styles.section}>
      <SectionHeading
        eyebrow="03 — HOW I BUILD SOFTWARE"
        title="From interface to database."
        subtitle="Every system I build starts as a simple, honest flow of responsibility."
      />

      <motion.div
        className={styles.row}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.12)}
      >
        <div className={styles.track} />
        <div className={styles.pulse} />

        {nodes.map((node) => (
          <motion.div
            key={node.id}
            className={styles.node}
            variants={fadeUp}
            whileHover={{ scale: 1.08 }}
            onMouseEnter={() => setHovered(node.id)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(node.id)}
            onBlur={() => setHovered(null)}
            tabIndex={0}
          >
            <div className={styles.label}>{node.label}</div>
            <AnimatePresence>
              {hovered === node.id && (
                <motion.div
                  className={styles.tooltip}
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  {node.details.map((detail) => (
                    <div key={detail}>▸ {detail}</div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
