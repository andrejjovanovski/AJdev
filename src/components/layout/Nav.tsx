"use client";

import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import type { Personal } from "@/lib/types";
import styles from "./Nav.module.css";

export type NavSection = { id: string; label: string };

type NavProps = {
  sections: NavSection[];
  activeSection: string;
  scrolled: boolean;
  personal: Personal;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onNavigate: (id: string) => void;
};

export function Nav({
  sections,
  activeSection,
  scrolled,
  personal,
  menuOpen,
  onToggleMenu,
  onNavigate,
}: NavProps) {
  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        <button type="button" className={styles.logo} onClick={() => onNavigate("hero")}>
          AJ<span className={styles.dot}>.</span>dev
        </button>

        <div className={styles.links}>
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => onNavigate(section.id)}
              className={`${styles.link} ${activeSection === section.id ? styles.active : ""}`}
            >
              {activeSection === section.id && (
                <motion.span
                  layoutId="nav-active-pill"
                  className={styles.activePill}
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className={styles.linkLabel}>{section.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.actions}>
          <ThemeToggle />
          <a
            href={personal.resume}
            className={styles.resume}
            target="_blank"
            rel="noreferrer"
          >
            Resume
          </a>
        </div>

        <button
          type="button"
          className={styles.burger}
          onClick={onToggleMenu}
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          <span className={styles.burgerLines}>
            <span className={menuOpen ? styles.line1Open : styles.line} />
            <span className={menuOpen ? styles.line2Open : styles.line} />
            <span className={menuOpen ? styles.line3Open : styles.line} />
          </span>
        </button>
      </div>
    </nav>
  );
}
