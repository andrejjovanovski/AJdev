import * as dummy from "@/lib/dummy-data";
import type {
  AboutCard,
  ArchitectureNode,
  AskFaq,
  GithubStats,
  Job,
  Personal,
  Project,
  SkillGroup,
} from "@/lib/types";
import {
  mapExperience,
  mapPersonal,
  mapProject,
  type BackendExperience,
  type BackendGeneralInformation,
  type BackendProject,
} from "./backend-map";
import { get, hasBackend } from "./client";

/**
 * Every read used by the site goes through here. With NEXT_PUBLIC_API_URL set
 * these hit the AJdevBackendApi (.NET) project and are mapped into `@/lib/types`
 * by `./backend-map`; without it, or if a request fails, they resolve to the
 * bundled sample data.
 *
 * The backend has no store yet for skills, GitHub stats, about-cards or the
 * architecture diagram, so those four still come from `dummy-data`.
 */

async function fromApi<Raw, T>(
  path: string,
  map: (raw: Raw) => T,
  fallback: T,
): Promise<T> {
  if (!hasBackend) return fallback;
  try {
    return map(await get<Raw>(path));
  } catch (err) {
    console.error(`[api] GET ${path} failed, falling back`, err);
    return fallback;
  }
}

export const getPersonal = () =>
  fromApi<BackendGeneralInformation, Personal>(
    "/api/GeneralInformation",
    mapPersonal,
    dummy.personal,
  );

export const getExperience = () =>
  fromApi<BackendExperience[], Job[]>(
    "/api/Experience",
    (rows) => rows.map(mapExperience),
    dummy.experience,
  );

export const getProjects = () =>
  fromApi<BackendProject[], Project[]>(
    "/api/Project",
    (rows) => rows.map(mapProject),
    dummy.projects,
  );

/** Not backed by the API yet — served from the bundled sample data. */
export const getSkills = async (): Promise<SkillGroup[]> => dummy.skills;
export const getGithubStats = async (): Promise<GithubStats> => dummy.github;
export const getAboutCards = async (): Promise<AboutCard[]> => dummy.aboutCards;
export const getArchitectureNodes = async (): Promise<ArchitectureNode[]> =>
  dummy.architectureNodes;
export const getAskFaq = async (): Promise<AskFaq[]> => dummy.askFaq;

export async function getProject(slug: string): Promise<Project | null> {
  if (hasBackend) {
    try {
      return mapProject(await get<BackendProject>(`/api/Project/by-slug/${encodeURIComponent(slug)}`));
    } catch {
      return null;
    }
  }
  return dummy.projects.find((p) => p.slug === slug) ?? null;
}

export type PortfolioContent = {
  personal: Personal;
  skills: SkillGroup[];
  experience: Job[];
  projects: Project[];
  github: GithubStats;
  aboutCards: AboutCard[];
  architecture: ArchitectureNode[];
};

export async function getPortfolioContent(): Promise<PortfolioContent> {
  const [personal, skills, experience, projects, github, aboutCards, architecture] =
    await Promise.all([
      getPersonal(),
      getSkills(),
      getExperience(),
      getProjects(),
      getGithubStats(),
      getAboutCards(),
      getArchitectureNodes(),
    ]);

  return { personal, skills, experience, projects, github, aboutCards, architecture };
}
