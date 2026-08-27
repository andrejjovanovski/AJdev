import * as dummy from "@/lib/dummy-data";
import type {
  AboutCard,
  ArchitectureNode,
  GithubStats,
  Job,
  Personal,
  Project,
  SkillGroup,
} from "@/lib/types";
import { get, hasBackend } from "./client";

/**
 * Every read used by the site goes through here. With NEXT_PUBLIC_API_URL set
 * these hit the real backend; without it they resolve to the bundled data, so
 * the endpoints can be switched on one at a time.
 */

async function fromApi<T>(path: string, fallback: T): Promise<T> {
  if (!hasBackend) return fallback;
  try {
    return await get<T>(path);
  } catch (err) {
    console.error(`[api] GET ${path} failed, falling back`, err);
    return fallback;
  }
}

export const getPersonal = () => fromApi<Personal>("/personal", dummy.personal);

export const getSkills = () => fromApi<SkillGroup[]>("/skills", dummy.skills);

export const getExperience = () => fromApi<Job[]>("/experience", dummy.experience);

export const getProjects = () => fromApi<Project[]>("/projects", dummy.projects);

export const getGithubStats = () => fromApi<GithubStats>("/github", dummy.github);

export const getAboutCards = () => fromApi<AboutCard[]>("/about-cards", dummy.aboutCards);

export const getArchitectureNodes = () =>
  fromApi<ArchitectureNode[]>("/architecture", dummy.architectureNodes);

export async function getProject(slug: string): Promise<Project | null> {
  if (hasBackend) {
    try {
      return await get<Project>(`/projects/${slug}`);
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
