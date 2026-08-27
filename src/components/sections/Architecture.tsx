"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
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

      <Reveal>
        <div className={styles.row}>
          <div className={styles.track} />
          <div className={styles.pulse} />

          {nodes.map((node) => (
            <div
              key={node.id}
              className={styles.node}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(node.id)}
              onBlur={() => setHovered(null)}
              tabIndex={0}
            >
              <div className={styles.label}>{node.label}</div>
              {hovered === node.id && (
                <div className={styles.tooltip}>
                  {node.details.map((detail) => (
                    <div key={detail}>▸ {detail}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
