"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Tag } from "@/components/ui/Tag";
import type { Project } from "@/lib/types";
import styles from "./ProjectModal.module.css";

export function ProjectModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!project) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  const sections = [
    { label: "OVERVIEW", text: project.overview },
    { label: "THE PROBLEM", text: project.problem },
    { label: "THE SOLUTION", text: project.solution },
    { label: "MY ROLE", text: project.role },
    { label: "ARCHITECTURE", text: project.architecture },
    { label: "CHALLENGES", text: project.challenges },
    { label: "RESULT", text: project.result },
    { label: "WHAT I LEARNED", text: project.learned },
  ].filter((section) => section.text);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${project.name} details`}
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <div className={styles.category}>{project.category}</div>
            <h2 className={styles.title}>{project.name}</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className={styles.close}
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <div className={styles.body}>
          <div className={styles.thumb}>product screenshot — {project.name}</div>

          <p className={styles.description}>{project.description}</p>

          <div className={styles.tech}>
            {project.tech.map((item) => (
              <Tag key={item}>{item}</Tag>
            ))}
          </div>

          <div className={styles.sections}>
            {sections.map((section) => (
              <section key={section.label}>
                <div className={styles.sectionLabel}>{section.label}</div>
                <p className={styles.sectionText}>{section.text}</p>
              </section>
            ))}

            {project.engineering.length > 0 && (
              <section>
                <div className={styles.sectionLabel}>ENGINEERING DECISIONS</div>
                <div className={styles.decisions}>
                  {project.engineering.map((item) => (
                    <div key={item} className={styles.decision}>
                      <span className={styles.bullet}>▸</span>
                      {item}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        <footer className={styles.footer}>
          <Link href={`/projects/${project.slug}`} className={styles.caseStudy}>
            Full case study →
          </Link>
          <div className={styles.actions}>
            <a href={project.live} target="_blank" rel="noreferrer" className={styles.primary}>
              View Live
            </a>
            <a href={project.github} target="_blank" rel="noreferrer" className={styles.ghost}>
              GitHub
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
