import type { Variants } from "framer-motion";

/** Shared easing + variants so every section animates with the same feel. */

export const EASE = [0.16, 1, 0.3, 1] as const;

export const viewportOnce = { once: true, amount: 0.2 } as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE, delay },
  }),
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.6, ease: EASE, delay },
  }),
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: EASE, delay },
  }),
};

export function staggerContainer(stagger = 0.08, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren } },
  };
}

export const lift = {
  whileHover: { y: -6 },
  whileTap: { scale: 0.98 },
};
