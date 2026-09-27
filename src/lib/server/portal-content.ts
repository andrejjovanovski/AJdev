import {
  mapExperience,
  mapPersonal,
  mapProject,
  type BackendExperience,
  type BackendGeneralInformation,
  type BackendProject,
} from "@/lib/api/backend-map";
import * as dummy from "@/lib/dummy-data";
import type { Job, Personal, PortalContent, Project, SkillGroup, Stat } from "@/lib/types";
import { portalJson } from "./portal-backend";
import type { Session } from "./session";

/**
 * Content the /portal dashboard reads and writes.
 *
 * Profile, experience and projects live in the backend (AJdevBackendApi) and are
 * read/written through it. Skills, the stats strip, terminal copy and the
 * theme/accent settings have no backend table yet, so they stay in an in-memory
 * store kept on `globalThis` (survives dev hot reloads, resets on restart).
 */

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

/* ---- local-only fields (no backend store yet) ---------------------------- */

type LocalExtras = Pick<
  PortalContent,
  "skills" | "stats" | "terminalAbout" | "accentPrimary" | "accentSuccess" | "defaultTheme"
> & { resume: string };

const globalStore = globalThis as typeof globalThis & { __portalExtras?: LocalExtras };

function getExtras(): LocalExtras {
  if (!globalStore.__portalExtras) {
    const d = defaultContent();
    globalStore.__portalExtras = {
      skills: d.skills,
      stats: d.stats,
      terminalAbout: d.terminalAbout,
      accentPrimary: d.accentPrimary,
      accentSuccess: d.accentSuccess,
      defaultTheme: d.defaultTheme,
      resume: d.personal.resume,
    };
  }
  return globalStore.__portalExtras;
}

/** Site-wide settings the public pages need without a portal session. */
export function getSiteSettings(): Pick<
  PortalContent,
  "defaultTheme" | "accentPrimary" | "accentSuccess"
> {
  const e = getExtras();
  return {
    defaultTheme: e.defaultTheme,
    accentPrimary: e.accentPrimary,
    accentSuccess: e.accentSuccess,
  };
}

/* ---- read -------------------------------------------------------------- */

export async function getContent(session: Session): Promise<PortalContent> {
  const [gi, experiences, projects] = await Promise.all([
    portalJson<BackendGeneralInformation>(session, "/api/GeneralInformation").catch(() => null),
    portalJson<BackendExperience[]>(session, "/api/Experience"),
    portalJson<BackendProject[]>(session, "/api/Project"),
  ]);

  const extras = getExtras();
  const personal: Personal = gi
    ? { ...mapPersonal(gi), resume: extras.resume }
    : { ...defaultContent().personal, resume: extras.resume };

  return sanitize({
    personal,
    stats: extras.stats,
    skills: extras.skills,
    experience: (experiences ?? []).map(mapExperience),
    projects: (projects ?? []).map(mapProject),
    terminalAbout: extras.terminalAbout,
    accentPrimary: extras.accentPrimary,
    accentSuccess: extras.accentSuccess,
    defaultTheme: extras.defaultTheme,
  });
}

/* ---- write ------------------------------------------------------------- */

const csv = (items: string[]) => items.join(",");

function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

async function savePersonal(session: Session, personal: Personal): Promise<void> {
  const current = await portalJson<BackendGeneralInformation>(
    session,
    "/api/GeneralInformation",
  ).catch(() => null);

  const { firstName, lastName } = splitName(personal.name);
  const body = {
    firstName,
    lastName,
    role: personal.role,
    roleDescription: current?.roleDescription ?? "",
    description: current?.description ?? "",
    email: personal.email,
    phone: current?.phone ?? "",
    location: personal.location,
    linkedInUrl: personal.linkedin,
    githubUrl: personal.github,
  };

  await portalJson(session, "/api/GeneralInformation", {
    method: current ? "PUT" : "POST",
    body: JSON.stringify(body),
  });
}

function projectBody(p: Project, existing?: { image: string; status: string }) {
  return {
    image: existing?.image ?? "",
    name: p.name,
    isFeatured: p.featured,
    category: p.category,
    slug: p.slug,
    description: p.description,
    tags: csv(p.tags),
    technologies: csv(p.tech),
    liveUrl: p.live,
    githubUrl: p.github,
    status: existing?.status ?? "",
    caseStudy: {
      overview: p.overview,
      problem: p.problem,
      solution: p.solution,
      role: p.role,
      architecture: p.architecture,
      challenges: p.challenges,
      result: p.result,
      learned: p.learned,
      engineeringDecisions: p.engineering.map((text) => ({ text })),
    },
  };
}

async function saveProjects(session: Session, projects: Project[]): Promise<void> {
  const current = (await portalJson<BackendProject[]>(session, "/api/Project")) ?? [];
  const bySlug = new Map(current.map((p) => [p.slug, p]));
  const submitted = new Set(projects.map((p) => p.slug));

  for (const project of projects) {
    const existing = bySlug.get(project.slug);
    if (existing) {
      await portalJson(session, `/api/Project/updateProject?id=${existing.id}`, {
        method: "PUT",
        body: JSON.stringify(projectBody(project, existing)),
      });
    } else {
      await portalJson(session, "/api/Project/createProject", {
        method: "POST",
        body: JSON.stringify(projectBody(project)),
      });
    }
  }

  for (const existing of current) {
    if (!submitted.has(existing.slug)) {
      await portalJson(session, `/api/Project/deleteProject?id=${existing.id}`, { method: "DELETE" });
    }
  }
}

/** Drafts carry no id, so match existing rows on company + role + period. */
const expSignature = (e: { company: string; role: string; period: string }) =>
  `${e.company}|${e.role}|${e.period}`.toLowerCase();

function experienceBody(job: Job, existing?: BackendExperience) {
  const description = [job.description, ...job.achievements].filter(Boolean).join("\n");
  return {
    company: job.company,
    role: job.role,
    roleDescription: existing?.roleDescription ?? job.description,
    description,
    workingPeriod: job.dates,
    technologies: csv(job.tech),
  };
}

async function saveExperience(session: Session, jobs: Job[]): Promise<void> {
  const current = (await portalJson<BackendExperience[]>(session, "/api/Experience")) ?? [];
  const bySig = new Map(
    current.map((e) => [
      expSignature({ company: e.company, role: e.role, period: e.workingPeriod }),
      e,
    ]),
  );
  const submitted = new Set(
    jobs.map((j) => expSignature({ company: j.company, role: j.role, period: j.dates })),
  );

  for (const job of jobs) {
    const sig = expSignature({ company: job.company, role: job.role, period: job.dates });
    const existing = bySig.get(sig);
    if (existing) {
      await portalJson(session, `/api/Experience/${existing.id}`, {
        method: "PUT",
        body: JSON.stringify(experienceBody(job, existing)),
      });
    } else {
      await portalJson(session, "/api/Experience", {
        method: "POST",
        body: JSON.stringify(experienceBody(job)),
      });
    }
  }

  for (const existing of current) {
    const sig = expSignature({
      company: existing.company,
      role: existing.role,
      period: existing.workingPeriod,
    });
    if (!submitted.has(sig)) {
      await portalJson(session, `/api/Experience/${existing.id}`, { method: "DELETE" });
    }
  }
}

export async function saveContent(session: Session, input: unknown): Promise<PortalContent> {
  const content = sanitize(input);

  // Local-only fields first — cheap and can't fail.
  globalStore.__portalExtras = {
    skills: content.skills,
    stats: content.stats,
    terminalAbout: content.terminalAbout,
    accentPrimary: content.accentPrimary,
    accentSuccess: content.accentSuccess,
    defaultTheme: content.defaultTheme,
    resume: content.personal.resume,
  };

  await savePersonal(session, content.personal);
  await saveProjects(session, content.projects);
  await saveExperience(session, content.experience);

  return getContent(session);
}

/* ---- sanitize (unchanged shape guard) -------------------------------- */

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
    resume: str(personalRaw.resume) || defaults.personal.resume,
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
