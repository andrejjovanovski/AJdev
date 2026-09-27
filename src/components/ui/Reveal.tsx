"use client";

import { motion } from "framer-motion";
import { fadeUp, viewportOnce } from "@/lib/motion";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      custom={delay / 1000}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeUp}
    >
      {children}
    </motion.div>
  );
}
