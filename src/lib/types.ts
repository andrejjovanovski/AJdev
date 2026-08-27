export type Personal = {
  name: string;
  role: string;
  location: string;
  email: string;
  github: string;
  linkedin: string;
  resume: string;
};

export type SkillGroup = {
  category: string;
  items: string[];
};

export type Job = {
  company: string;
  role: string;
  dates: string;
  location: string;
  description: string;
  achievements: string[];
  tech: string[];
};

export type Project = {
  slug: string;
  name: string;
  featured: boolean;
  category: string;
  description: string;
  tags: string[];
  tech: string[];
  live: string;
  github: string;
  image?: string;
  overview: string;
  problem: string;
  solution: string;
  role: string;
  engineering: string[];
  result: string;
  architecture: string;
  challenges: string;
  learned: string;
};

export type GithubStats = {
  totalRepos: number;
  totalContributions: number;
  streak: number;
  recent: { name: string; desc: string; lang: string }[];
};

export type AboutCard = {
  label: string;
  value: string;
  icon: "pin" | "layers" | "code" | "spark";
};

export type ArchitectureNode = {
  id: string;
  label: string;
  details: string[];
};

export type Stat = {
  value: number;
  suffix: string;
  label: string;
};

/** Everything the /portal dashboard can edit. */
export type PortalContent = {
  personal: Personal;
  stats: Stat[];
  skills: SkillGroup[];
  experience: Job[];
  projects: Project[];
  terminalAbout: string;
  accentPrimary: string;
  accentSuccess: string;
  defaultTheme: "light" | "dark";
};

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
  source?: "form" | "terminal";
};

export type RatingPayload = {
  score: number;
  feedback?: string;
  source?: "terminal" | "portfolio";
};
