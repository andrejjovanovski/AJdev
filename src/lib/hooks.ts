"use client";

import { useEffect, useRef, useState } from "react";

/** Fades a section in the first time it scrolls into view. */
export function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

export function useScrollState(sectionIds: string[]) {
  const [progress, setProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(sectionIds[0] ?? "");
  const suppressUntil = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight || 1;
      setProgress(Math.min(100, (window.scrollY / docHeight) * 100));
      setScrolled(window.scrollY > 40);

      // While a click-triggered smooth scroll is in flight, the nav's active
      // link is already set to the target — don't let the sections it's
      // scrolling past briefly override it.
      if (Date.now() < suppressUntil.current) return;

      let active = sectionIds[0] ?? "";
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) active = id;
      }
      setActiveSection(active);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sectionIds]);

  const goToSection = (id: string) => {
    setActiveSection(id);
    suppressUntil.current = Date.now() + 800;
    scrollToSection(id);
  };

  return { progress, scrolled, activeSection, goToSection };
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = () => setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY - 80,
    behavior: "smooth",
  });
}
