import type {
  AboutCard,
  ArchitectureNode,
  GithubStats,
  Job,
  Personal,
  Project,
  SkillGroup,
  Stat,
} from "./types";

/**
 * Stand-in content used until the backend is wired up. Everything here is
 * served through `src/lib/api` so swapping in real endpoints touches one file.
 */

export const personal: Personal = {
  name: "Andrej Jovanovski",
  role: "Software Engineer",
  location: "North Macedonia",
  email: "andrej@example.com",
  github: "https://github.com/andrejjovanovski",
  linkedin: "https://www.linkedin.com/in/andrej-jovanovski-20b7231ab/",
  resume: "#",
};

export const stats: Stat[] = [
  { value: 10, suffix: "+", label: "Projects Built" },
  { value: 14, suffix: "", label: "Technologies" },
  { value: 100, suffix: "%", label: "Full Stack" },
  { value: 0, suffix: "∞", label: "Problems to Solve" },
];

/** Response to `/about` in terminal mode. */
export const terminalAbout =
  "I build complete products end to end — backend systems, APIs, databases and the frontend that ties it together.";

export const skills: SkillGroup[] = [
  {
    category: "Backend",
    items: ["PHP", "Laravel", "C#", ".NET", "REST APIs", "SOAP APIs"],
  },
  {
    category: "Frontend",
    items: ["React", "Next.js", "JavaScript", "TypeScript", "HTML", "CSS", "Tailwind"],
  },
  {
    category: "Databases",
    items: ["PostgreSQL", "MySQL", "Oracle", "SQL", "PL/SQL"],
  },
  {
    category: "DevOps / Tools",
    items: ["Docker", "Git", "GitHub", "Linux", "Postman", "CI/CD"],
  },
];

export const experience: Job[] = [
  {
    company: "Nexora Systems",
    role: "Software Engineer",
    dates: "2023 — Present",
    location: "Remote",
    description:
      "Building and maintaining full-stack business applications used by internal teams and external clients.",
    achievements: [
      "Designed a REST API platform handling 40+ endpoints across 3 microservices",
      "Cut average page load time by 35% through query and bundle optimization",
      "Led migration of a legacy PHP monolith toward a modular Laravel architecture",
    ],
    tech: ["Laravel", "PHP", "PostgreSQL", "React", "Docker"],
  },
  {
    company: "Vantix Digital",
    role: "Backend Developer",
    dates: "2021 — 2023",
    location: "Skopje, North Macedonia",
    description:
      "Developed backend services and integrations for logistics and transportation clients.",
    achievements: [
      "Built a SOAP-to-REST bridge integrating legacy transport systems",
      "Implemented CI/CD pipelines reducing deployment time from hours to minutes",
      "Owned database schema design for a system handling real-world transportation data",
    ],
    tech: ["C#", ".NET", "SQL Server", "Docker", "Git"],
  },
  {
    company: "Freelance",
    role: "Junior Developer",
    dates: "2019 — 2021",
    location: "Remote",
    description: "Delivered small business web applications and internal tools for local clients.",
    achievements: [
      "Shipped 6+ client websites and internal tools end to end",
      "Introduced version control and structured workflows to first-time clients",
    ],
    tech: ["JavaScript", "HTML", "CSS", "MySQL"],
  },
];

export const projects: Project[] = [
  {
    slug: "transitflow",
    name: "TransitFlow",
    featured: true,
    category: "Responsive Web Application",
    description:
      "A real-time public transportation planning platform used to track routes, schedules and live vehicle positions across a metro network.",
    tags: ["Built for real users", "Responsive Web Application", "Real-world transportation data"],
    tech: ["React", "TypeScript", "Laravel", "PostgreSQL", "Docker"],
    live: "#",
    github: "#",
    overview:
      "TransitFlow helps commuters plan trips across a city's bus and rail network with live vehicle tracking and schedule data.",
    problem:
      "Riders lacked a single reliable source for real-time transit data; existing tools were outdated or inaccurate.",
    solution:
      "Built a unified platform ingesting live GPS feeds and static schedules, exposed through a clean REST API and a fast, map-first UI.",
    role: "Designed the API and PostGIS data model end to end, and built the map-first frontend.",
    engineering: [
      "Geospatial queries via PostGIS for nearest-stop and route lookups",
      "Confidence-scored GPS reconciliation layer",
      "Dockerized services behind an nginx gateway",
    ],
    result: "Used daily by commuters; sub-200ms average API response under live polling.",
    architecture:
      "React/TypeScript frontend, Laravel REST API, PostgreSQL with PostGIS for geospatial queries, Dockerized services behind an nginx gateway.",
    challenges:
      "Reconciling noisy real-time GPS data with static schedules without misleading riders required a confidence-scoring layer on top of raw feeds.",
    learned:
      "Deepened experience with geospatial data modeling and designing APIs that stay fast under high-frequency polling.",
  },
  {
    slug: "ledgerly",
    name: "Ledgerly",
    featured: false,
    category: "SaaS Dashboard",
    description:
      "A small-business invoicing and expense tracker with automated recurring billing and financial reporting.",
    tags: [],
    tech: ["Next.js", "TypeScript", "PostgreSQL", "Stripe"],
    live: "#",
    github: "#",
    overview:
      "Ledgerly gives small businesses a lightweight alternative to bloated accounting suites.",
    problem: "Freelancers needed fast invoicing without enterprise accounting overhead.",
    solution:
      "A focused dashboard for invoices, recurring billing and reporting, backed by a typed API layer.",
    role: "Built the billing engine and API layer; partnered on the dashboard UI.",
    engineering: [
      "Idempotent recurring-billing workflow with retry/backoff",
      "Typed API contracts shared between frontend and backend",
      "Stripe webhook reconciliation",
    ],
    result: "Automated recurring billing for real client accounts, removing manual invoicing.",
    architecture:
      "Next.js App Router frontend, typed API routes, PostgreSQL via Prisma, Stripe for payments.",
    challenges:
      "Modeling recurring billing edge cases (proration, failed payments, retries) cleanly.",
    learned: "Improved skills in designing idempotent billing workflows.",
  },
  {
    slug: "queuepilot",
    name: "QueuePilot",
    featured: false,
    category: "Internal Tool",
    description:
      "An internal job-queue monitoring dashboard giving engineering teams visibility into background job health.",
    tags: [],
    tech: ["React", "Spring Boot", "Java", "MySQL"],
    live: "#",
    github: "#",
    overview:
      "QueuePilot visualizes background job throughput, failures and retries across services.",
    problem: "Engineers had no visibility into queue health without digging through logs.",
    solution: "A live dashboard aggregating queue metrics with alerting on failure spikes.",
    role: "Sole engineer — backend polling service, metrics schema and dashboard.",
    engineering: [
      "Multi-backend polling without blocking the event loop",
      "Alerting thresholds on failure-rate spikes",
      "Historical metrics rollups in MySQL",
    ],
    result: "Cut mean-time-to-detect queue failures from hours to minutes.",
    architecture:
      "Spring Boot service polling queue backends, MySQL for historical metrics, React dashboard with polling updates.",
    challenges: "Keeping the dashboard performant while polling multiple queue backends at once.",
    learned: "Gained deeper understanding of observability tooling design.",
  },
  {
    slug: "briefcase-api",
    name: "Briefcase API",
    featured: false,
    category: "Developer Tool",
    description:
      "A document-generation API turning structured JSON into branded PDF reports and contracts.",
    tags: [],
    tech: [".NET", "C#", "Docker", "REST APIs"],
    live: "#",
    github: "#",
    overview:
      "Briefcase API lets other services generate polished PDF documents from structured data.",
    problem: "Multiple internal services duplicated PDF-generation logic inconsistently.",
    solution: "A single templated document-generation service exposed as a versioned REST API.",
    role: "Designed the API contract and templating engine.",
    engineering: [
      "Versioned REST API consumed by 4 internal services",
      "HTML-to-PDF templating with reusable layout components",
      "Horizontally scalable via containerized workers",
    ],
    result: "Replaced 3 duplicated PDF pipelines with one shared service.",
    architecture:
      ".NET service rendering HTML templates to PDF, containerized and horizontally scalable.",
    challenges: "Handling complex multi-page layouts consistently across templates.",
    learned: "Learned to design APIs as internal platform products, not one-off endpoints.",
  },
];

export const github: GithubStats = {
  totalRepos: 32,
  totalContributions: 1284,
  streak: 46,
  recent: [
    { name: "transitflow", desc: "Real-time transit planning platform", lang: "TypeScript" },
    { name: "ledgerly", desc: "Invoicing & billing SaaS", lang: "TypeScript" },
    { name: "queuepilot", desc: "Job queue monitoring dashboard", lang: "Java" },
    { name: "briefcase-api", desc: "PDF document generation API", lang: "C#" },
  ],
};

export const aboutCards: AboutCard[] = [
  { label: "LOCATION", value: personal.location, icon: "pin" },
  { label: "FOCUS", value: "Full-Stack Engineering", icon: "layers" },
  { label: "EXPERIENCE", value: "Web Apps & APIs", icon: "code" },
  { label: "CURRENT INTEREST", value: "Product Engineering", icon: "spark" },
];

export const architectureNodes: ArchitectureNode[] = [
  {
    id: "client",
    label: "Client",
    details: ["Browser or mobile app", "Renders the UI", "Sends requests"],
  },
  {
    id: "frontend",
    label: "Frontend",
    details: ["React / Next.js", "State management", "UX & accessibility"],
  },
  {
    id: "api",
    label: "API",
    details: ["RESTful endpoints", "Auth & authorization", "Validation & error handling"],
  },
  {
    id: "application",
    label: "Application",
    details: ["Business logic & services", "DTOs", "Dependency injection"],
  },
  {
    id: "database",
    label: "Database",
    details: ["Relational modeling", "Transactions", "Query optimization"],
  },
];
