import type { Job, Personal, Project } from "@/lib/types";
import { resolveAsset } from "./client";

/**
 * The AJdevBackendApi (.NET) project speaks a different dialect than the site:
 * PascalCase entities serialised to camelCase JSON, comma-joined strings where
 * the UI wants arrays, and a nested `caseStudy` where the UI wants a flat
 * `Project`. Everything crossing that boundary goes through the pure mappers
 * here so the rest of the app keeps working in `@/lib/types`.
 */

export type BackendGeneralInformation = {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  roleDescription: string;
  description: string;
  email: string;
  phone: string;
  location: string;
  linkedInUrl: string;
  githubUrl: string;
};

export type BackendExperience = {
  id: number;
  company: string;
  role: string;
  roleDescription: string;
  description: string;
  workingPeriod: string;
  technologies: string;
};

export type BackendEngineeringDecision = { id: number; text: string };

export type BackendCaseStudy = {
  id: number;
  overview: string;
  problem: string;
  solution: string;
  role: string;
  architecture: string;
  challenges: string;
  result: string;
  learned: string;
  engineeringDecisions: BackendEngineeringDecision[];
};

export type BackendProject = {
  id: number;
  image: string;
  name: string;
  isFeatured: boolean;
  category: string;
  slug: string;
  description: string;
  tags: string;
  technologies: string;
  liveUrl: string;
  githubUrl: string;
  status: string;
  caseStudy: BackendCaseStudy | null;
};

/** Split a comma-joined backend string into a trimmed, non-empty list. */
export const splitList = (value: string | null | undefined): string[] =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

/** Split a newline-joined backend string into a trimmed, non-empty list. */
export const splitLines = (value: string | null | undefined): string[] =>
  (value ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

export function mapPersonal(gi: BackendGeneralInformation): Personal {
  return {
    name: `${gi.firstName ?? ""} ${gi.lastName ?? ""}`.trim(),
    role: gi.role ?? "",
    location: gi.location ?? "",
    email: gi.email ?? "",
    github: gi.githubUrl ?? "",
    linkedin: gi.linkedInUrl ?? "",
    resume: "/resume",
  };
}

export function mapExperience(e: BackendExperience): Job {
  const lines = splitLines(e.description);
  // The first line is the summary; the rest read as achievement bullets.
  const [summary, ...achievements] = lines;
  return {
    company: e.company ?? "",
    role: e.role ?? "",
    dates: e.workingPeriod ?? "",
    location: "",
    description: summary ?? e.roleDescription ?? "",
    achievements,
    tech: splitList(e.technologies),
  };
}

export function mapProject(p: BackendProject): Project {
  const cs = p.caseStudy;
  const image = resolveAsset(p.image);
  return {
    slug: p.slug ?? "",
    name: p.name ?? "",
    featured: Boolean(p.isFeatured),
    category: p.category ?? "",
    description: p.description ?? "",
    tags: splitList(p.tags),
    tech: splitList(p.technologies),
    live: p.liveUrl ?? "",
    github: p.githubUrl ?? "",
    ...(image ? { image } : {}),
    overview: cs?.overview ?? "",
    problem: cs?.problem ?? "",
    solution: cs?.solution ?? "",
    role: cs?.role ?? "",
    engineering: cs?.engineeringDecisions?.map((d) => d.text).filter(Boolean) ?? [],
    result: cs?.result ?? "",
    architecture: cs?.architecture ?? "",
    challenges: cs?.challenges ?? "",
    learned: cs?.learned ?? "",
  };
}
