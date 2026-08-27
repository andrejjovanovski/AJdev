import type { Personal, PortalContent } from "@/lib/types";

/**
 * The editor works on a draft where every list is plain text — comma-separated
 * for tags, one-per-line for achievements. Splitting on each keystroke would
 * eat separators as they're typed, so the conversion happens only on load and
 * on save.
 */

export type DraftSkillGroup = { category: string; items: string };

export type DraftJob = {
  company: string;
  role: string;
  dates: string;
  location: string;
  description: string;
  achievements: string;
  tech: string;
};

export type DraftProject = {
  slug: string;
  name: string;
  featured: boolean;
  category: string;
  description: string;
  tags: string;
  tech: string;
  live: string;
  github: string;
  overview: string;
  problem: string;
  solution: string;
  role: string;
  engineering: string;
  result: string;
  architecture: string;
  challenges: string;
  learned: string;
  /** UI only — whether the case-study fields are open. */
  expanded: boolean;
};

export type DraftStat = { value: string; suffix: string; label: string };

export type Draft = {
  personal: Personal;
  stats: DraftStat[];
  skills: DraftSkillGroup[];
  experience: DraftJob[];
  projects: DraftProject[];
  terminalAbout: string;
  accentPrimary: string;
  accentSuccess: string;
  defaultTheme: "light" | "dark";
};

const csv = (items: string[]) => items.join(", ");
const lines = (items: string[]) => items.join("\n");

const fromCsv = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const fromLines = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

export function toDraft(content: PortalContent): Draft {
  return {
    personal: { ...content.personal },
    stats: content.stats.map((s) => ({ ...s, value: String(s.value) })),
    skills: content.skills.map((g) => ({ category: g.category, items: csv(g.items) })),
    experience: content.experience.map((j) => ({
      ...j,
      achievements: lines(j.achievements),
      tech: csv(j.tech),
    })),
    projects: content.projects.map((p) => ({
      ...p,
      tags: csv(p.tags),
      tech: csv(p.tech),
      engineering: lines(p.engineering),
      expanded: false,
    })),
    terminalAbout: content.terminalAbout,
    accentPrimary: content.accentPrimary,
    accentSuccess: content.accentSuccess,
    defaultTheme: content.defaultTheme,
  };
}

export function fromDraft(draft: Draft): PortalContent {
  return {
    personal: { ...draft.personal },
    stats: draft.stats.map((s) => ({
      value: Number.parseFloat(s.value) || 0,
      suffix: s.suffix,
      label: s.label,
    })),
    skills: draft.skills.map((g) => ({ category: g.category, items: fromCsv(g.items) })),
    experience: draft.experience.map((j) => ({
      ...j,
      achievements: fromLines(j.achievements),
      tech: fromCsv(j.tech),
    })),
    projects: draft.projects.map((project) => {
      const { expanded, ...p } = project;
      void expanded; // UI state, not content.
      return {
        ...p,
        tags: fromCsv(p.tags),
        tech: fromCsv(p.tech),
        engineering: fromLines(p.engineering),
      };
    }),
    terminalAbout: draft.terminalAbout,
    accentPrimary: draft.accentPrimary,
    accentSuccess: draft.accentSuccess,
    defaultTheme: draft.defaultTheme,
  };
}

export const emptySkillGroup = (): DraftSkillGroup => ({ category: "New category", items: "" });

export const emptyJob = (): DraftJob => ({
  company: "",
  role: "",
  dates: "",
  location: "",
  description: "",
  achievements: "",
  tech: "",
});

export const emptyProject = (): DraftProject => ({
  slug: "",
  name: "New project",
  featured: false,
  category: "",
  description: "",
  tags: "",
  tech: "",
  live: "",
  github: "",
  overview: "",
  problem: "",
  solution: "",
  role: "",
  engineering: "",
  result: "",
  architecture: "",
  challenges: "",
  learned: "",
  expanded: true,
});

export const emptyStat = (): DraftStat => ({ value: "0", suffix: "", label: "" });
