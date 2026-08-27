import * as dummy from "@/lib/dummy-data";
import type { Job, Personal, PortalContent, Project, SkillGroup, Stat } from "@/lib/types";

/**
 * Content the /portal dashboard reads and writes.
 *
 * In-memory until the backend exists — same deal as `ratings.ts`: swap `store`
 * for a database call, or set NEXT_PUBLIC_API_URL and these forward to
 * `GET/PUT /content` instead. Kept on globalThis so it survives hot reloads.
 */

const BACKEND = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

export function defaultContent(): PortalContent {
  return {
    personal: { ...dummy.personal },
    stats: dummy.stats.map((s) => ({ ...s })),
    skills: dummy.skills.map((g) => ({ ...g, items: [...g.items] })),
    experience: dummy.experience.map((j) => ({
      ...j,
      achievements: [...j.achievements],
      tech: [...j.tech],
    })),
    projects: dummy.projects.map((p) => ({
      ...p,
      tags: [...p.tags],
      tech: [...p.tech],
      engineering: [...p.engineering],
    })),
    terminalAbout: dummy.terminalAbout,
    accentPrimary: "#5b7fff",
    accentSuccess: "#5ee6a0",
    defaultTheme: "light",
  };
}

const globalStore = globalThis as typeof globalThis & { __portalContent?: PortalContent };

export async function getContent(): Promise<PortalContent> {
  if (BACKEND) {
    const res = await fetch(`${BACKEND}/content`, { cache: "no-store" });
    if (!res.ok) throw new Error(`backend responded ${res.status}`);
    return sanitize(await res.json());
  }

  return (globalStore.__portalContent ??= defaultContent());
}

export async function saveContent(input: unknown): Promise<PortalContent> {
  const content = sanitize(input);

  if (BACKEND) {
    const res = await fetch(`${BACKEND}/content`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    if (!res.ok) throw new Error(`backend responded ${res.status}`);
    return sanitize(await res.json());
  }

  globalStore.__portalContent = content;
  return content;
}

/* Anything arriving from the browser or the backend goes through here, so a
 * malformed payload can never reach the site's render paths. */

const str = (value: unknown, fallback = "") =>
  typeof value === "string" ? value.trim() : fallback;

const strList = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((item) => str(item)).filter(Boolean) : [];

const list = <T>(value: unknown, map: (item: Record<string, unknown>, index: number) => T): T[] =>
  Array.isArray(value)
    ? value
        .filter(
          (item): item is Record<string, unknown> => typeof item === "object" && item !== null,
        )
        .map(map)
    : [];

function slugify(value: string, fallback: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

export function sanitize(input: unknown): PortalContent {
  const raw = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  const defaults = defaultContent();
  const personalRaw = (
    typeof raw.personal === "object" && raw.personal !== null ? raw.personal : {}
  ) as Record<string, unknown>;

  const personal: Personal = {
    name: str(personalRaw.name, defaults.personal.name),
    role: str(personalRaw.role, defaults.personal.role),
    location: str(personalRaw.location),
    email: str(personalRaw.email),
    github: str(personalRaw.github),
    linkedin: str(personalRaw.linkedin),
    resume: str(personalRaw.resume),
  };

  const stats: Stat[] = list(raw.stats, (s) => ({
    value: Number.isFinite(Number(s.value)) ? Number(s.value) : 0,
    suffix: str(s.suffix),
    label: str(s.label),
  }));

  const skills: SkillGroup[] = list(raw.skills, (g) => ({
    category: str(g.category),
    items: strList(g.items),
  }));

  const experience: Job[] = list(raw.experience, (j) => ({
    company: str(j.company),
    role: str(j.role),
    dates: str(j.dates),
    location: str(j.location),
    description: str(j.description),
    achievements: strList(j.achievements),
    tech: strList(j.tech),
  }));

  const projects: Project[] = list(raw.projects, (p, index) => {
    const name = str(p.name);
    return {
      slug: slugify(str(p.slug) || name, `project-${index + 1}`),
      name,
      featured: p.featured === true,
      category: str(p.category),
      description: str(p.description),
      tags: strList(p.tags),
      tech: strList(p.tech),
      live: str(p.live),
      github: str(p.github),
      ...(str(p.image) ? { image: str(p.image) } : {}),
      overview: str(p.overview),
      problem: str(p.problem),
      solution: str(p.solution),
      role: str(p.role),
      engineering: strList(p.engineering),
      result: str(p.result),
      architecture: str(p.architecture),
      challenges: str(p.challenges),
      learned: str(p.learned),
    };
  });

  const hex = (value: unknown, fallback: string) => {
    const candidate = str(value);
    return /^#[0-9a-fA-F]{6}$/.test(candidate) ? candidate.toLowerCase() : fallback;
  };

  return {
    personal,
    stats,
    skills,
    experience,
    projects,
    terminalAbout: str(raw.terminalAbout, defaults.terminalAbout),
    accentPrimary: hex(raw.accentPrimary, defaults.accentPrimary),
    accentSuccess: hex(raw.accentSuccess, defaults.accentSuccess),
    defaultTheme: raw.defaultTheme === "dark" ? "dark" : "light",
  };
}
