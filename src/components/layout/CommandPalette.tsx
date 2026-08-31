"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { scrollToSection } from "@/lib/hooks";
import type { Personal } from "@/lib/types";
import styles from "./CommandPalette.module.css";

type PaletteItem = {
  label: string;
  hint: string;
  action: () => void;
};

export function CommandPalette({
  open,
  onOpenChange,
  personal,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personal: Personal;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);

  const items = useMemo<PaletteItem[]>(() => {
    const goTo = (id: string) => () => scrollToSection(id);
    const open = (url: string) => () => window.open(url, "_blank", "noreferrer");

    return [
      { label: "Home", hint: "go", action: goTo("hero") },
      { label: "Projects", hint: "go", action: goTo("projects") },
      { label: "Skills", hint: "go", action: goTo("skills") },
      { label: "Experience", hint: "go", action: goTo("experience") },
      { label: "About", hint: "go", action: goTo("about") },
      { label: "Contact", hint: "go", action: goTo("contact") },
      { label: "All Projects", hint: "open", action: () => router.push("/projects") },
      { label: "Terminal Mode", hint: "open", action: () => router.push("/terminal") },
      { label: "GitHub", hint: "open", action: open(personal.github) },
      { label: "LinkedIn", hint: "open", action: open(personal.linkedin) },
      { label: "Download Resume", hint: "open", action: open(personal.resume) },
    ];
  }, [personal, router]);

  const results = useMemo(
    () => items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setIndex(0);
    }
  }, [open]);

  if (!open) return null;

  const select = (item: PaletteItem | undefined) => {
    if (!item) return;
    item.action();
    onOpenChange(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      select(results[index]);
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={() => onOpenChange(false)} role="presentation">
      <div className={styles.box} onClick={(e) => e.stopPropagation()}>
        <div className={styles.field}>
          <span className={styles.badge}>⌘K</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search pages and actions..."
            className={styles.input}
            aria-label="Search pages and actions"
          />
        </div>
        <div className={styles.results}>
          {results.map((item, i) => (
            <button
              key={item.label}
              type="button"
              onClick={() => select(item)}
              onMouseEnter={() => setIndex(i)}
              className={`${styles.result} ${i === index ? styles.selected : ""}`}
            >
              <span>{item.label}</span>
              <span className={styles.hint}>{item.hint}</span>
            </button>
          ))}
          {!results.length && <div className={styles.empty}>No matches.</div>}
        </div>
      </div>
    </div>
  );
}
