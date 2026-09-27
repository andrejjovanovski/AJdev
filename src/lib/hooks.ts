"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

/** How long scrolling must pause before a click-triggered smooth scroll counts as finished. */
const SCROLL_SETTLE_MS = 150;

/**
 * Nav state derived from scroll position. Only changes of `scrolled` or the
 * active section re-render — scroll progress lives in `ScrollProgress` as a
 * motion value, because re-rendering the page every frame made animations lag.
 */
export function useScrollState(sectionIds: string[]) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(sectionIds[0] ?? "");
  const navigating = useRef(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const syncActive = useCallback(() => {
    let active = sectionIds[0] ?? "";
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 140) active = id;
    }
    setActiveSection(active);
  }, [sectionIds]);

  /** Holds the clicked link active until the smooth scroll stops moving. */
  const settleAfterIdle = useCallback(() => {
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      navigating.current = false;
      syncActive();
    }, SCROLL_SETTLE_MS);
  }, [syncActive]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);

      // While a click-triggered smooth scroll is in flight, the nav's active
      // link is already set to the target — don't let the sections it's
      // scrolling past briefly override it.
      if (navigating.current) settleAfterIdle();
      else syncActive();
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(settleTimer.current);
    };
  }, [syncActive, settleAfterIdle]);

  const goToSection = (id: string) => {
    setActiveSection(id);
    navigating.current = true;
    // Also covers clicking the section you're already on, where no scroll event fires.
    settleAfterIdle();
    scrollToSection(id);
  };

  return { scrolled, activeSection, goToSection };
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
