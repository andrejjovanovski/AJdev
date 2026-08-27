"use client";

import { useCallback, useEffect, useState } from "react";
import { BitmojiPeek } from "@/components/layout/BitmojiPeek";
import { BootLoader } from "@/components/layout/BootLoader";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { Footer } from "@/components/layout/Footer";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Nav, type NavSection } from "@/components/layout/Nav";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { About } from "@/components/sections/About";
import { Architecture } from "@/components/sections/Architecture";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Github } from "@/components/sections/Github";
import { Hero } from "@/components/sections/Hero";
import { Philosophy } from "@/components/sections/Philosophy";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import type { PortfolioContent } from "@/lib/api/content";
import { useScrollState } from "@/lib/hooks";

const SECTIONS: NavSection[] = [
  { id: "hero", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

const SECTION_IDS = SECTIONS.map((s) => s.id);

export function Portfolio({ content }: { content: PortfolioContent }) {
  const { personal, projects, skills, experience, github, aboutCards, architecture } = content;
  const { progress, scrolled, activeSection } = useScrollState(SECTION_IDS);

  const [booting, setBooting] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const typing = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName ?? "");

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      } else if (e.key === "Escape") {
        setPaletteOpen(false);
        setMenuOpen(false);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const finishBoot = useCallback(() => setBooting(false), []);

  return (
    <>
      {booting && <BootLoader onDone={finishBoot} />}
      <ScrollProgress progress={progress} />
      <CustomCursor />

      <Nav
        sections={SECTIONS}
        activeSection={activeSection}
        scrolled={scrolled}
        personal={personal}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((open) => !open)}
      />
      <MobileMenu
        open={menuOpen}
        sections={SECTIONS}
        activeSection={activeSection}
        personal={personal}
        onClose={() => setMenuOpen(false)}
      />

      <main>
        <Hero personal={personal} />
        <Projects projects={projects} />
        <Skills skills={skills} />
        <Architecture nodes={architecture} />
        <Experience jobs={experience} />
        <About cards={aboutCards} />
        <Github stats={github} personal={personal} />
        <Philosophy />
        <Contact personal={personal} />
      </main>

      <Footer personal={personal} />
      <BitmojiPeek />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} personal={personal} />
    </>
  );
}
