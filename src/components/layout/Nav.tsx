"use client";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { scrollToSection } from "@/lib/hooks";
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
};

export function Nav({
  sections,
  activeSection,
  scrolled,
  personal,
  menuOpen,
  onToggleMenu,
}: NavProps) {
  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        <button type="button" className={styles.logo} onClick={() => scrollToSection("hero")}>
          AJ<span className={styles.dot}>.</span>dev
        </button>

        <div className={styles.links}>
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              className={`${styles.link} ${activeSection === section.id ? styles.active : ""}`}
            >
              {section.label}
            </button>
          ))}
        </div>

        <div className={styles.actions}>
          <ThemeToggle />
          <a href={personal.resume} className={styles.resume}>
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
