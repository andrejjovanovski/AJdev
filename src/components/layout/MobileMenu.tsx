"use client";

import { useEffect } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { scrollToSection } from "@/lib/hooks";
import type { Personal } from "@/lib/types";
import type { NavSection } from "./Nav";
import styles from "./MobileMenu.module.css";

type MobileMenuProps = {
  open: boolean;
  sections: NavSection[];
  activeSection: string;
  personal: Personal;
  onClose: () => void;
};

export function MobileMenu({ open, sections, activeSection, personal, onClose }: MobileMenuProps) {
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className={`${styles.overlay} ${open ? styles.open : ""}`} aria-hidden={!open}>
      <button type="button" className={styles.close} onClick={onClose} aria-label="Close menu">
        <span className={styles.closeLine} />
        <span className={styles.closeLineAlt} />
      </button>

      <div className={styles.items}>
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            className={`${styles.item} ${activeSection === section.id ? styles.itemActive : ""}`}
            onClick={() => {
              scrollToSection(section.id);
              onClose();
            }}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className={styles.links}>
        <a href={personal.github} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href={personal.linkedin} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a href={personal.resume}>Resume</a>
        <button type="button" onClick={toggleTheme} className={styles.themeButton}>
          {theme === "light" ? "Dark mode" : "Light mode"}
        </button>
      </div>
    </div>
  );
}
