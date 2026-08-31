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
  resume: "/resume",
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
    company: "Involve Development",
    role: "Software Engineer",
    dates: "Jun 2025 — Present",
    location: "Skopje, North Macedonia",
    description:
      "Building and maintaining backend APIs and business logic while shipping responsive frontends for full-stack web applications.",
    achievements: [
      "Build and maintain backend APIs and business logic with Laravel/PHP, supporting reliable integration between frontend and backend systems",
      "Implement Elasticsearch-powered search across large datasets and write optimized PostgreSQL queries for complex relational data",
      "Develop responsive React interfaces with a focus on usability, maintainability, and performance",
    ],
    tech: ["Laravel", "PHP", "Elasticsearch", "PostgreSQL", "React", "TypeScript"],
  },
  {
    company: "RevelApps (Contract)",
    role: "Software Engineer",
    dates: "Jul 2024 — Sep 2026",
    location: "Remote",
    description:
      "Contract software engineer delivering web applications across several client projects.",
    achievements: [
      "Breathe.mk (Jul 2024 – Nov 2024): contributed to a web application for tracking, reporting, and managing air pollution levels",
      "Velnes.mk (Dec 2025 – Mar 2026): built a multi-tenancy web application with admin dashboards for managing beauty services in Macedonia, driving a 15% higher reservation rate across multiple salons",
      "Reservation system (May 2026 – Sep 2026): led development of an advanced reservation management system for restaurants and hotels, integrating with existing POS software",
    ],
    tech: ["Laravel", "PHP", "C#", ".NET", "React", "PostgreSQL"],
  },
  {
    company: "Multimedia-NET",
    role: "Web Developer",
    dates: "Jan 2022 — May 2025",
    location: "Skopje, North Macedonia",
    description:
      "Engineered a full Network Management System and supporting tooling for enterprise network infrastructure.",
    achievements: [
      "End-to-end NMS development: engineered a comprehensive Network Management System to monitor health, status, and performance of enterprise network infrastructure",
      "Network mapping & GIS: developed interactive geospatial modules to visualize network topology and coverage areas, helping operators pinpoint physical device locations and coverage gaps",
      "Device communication: implemented backend services to poll multi-vendor network devices via SNMP, CLI/SSH, and NETCONF to extract critical telemetry data",
      "CMS & inventory: designed a custom Content Management System for managing network inventory assets, configuration templates, and operational documentation",
    ],
    tech: ["PHP", "Laravel", "C#", ".NET", "JavaScript", "PostgreSQL", "SNMP", "GIS"],
  },
  {
    company: "Multimedia-NET",
    role: "System Network Administrator",
    dates: "Jun 2019 — Dec 2021",
    location: "Skopje, North Macedonia",
    description:
      "Maintained enterprise network infrastructure and supervised field operations.",
    achievements: [
      "Managed, maintained, and troubleshot network equipment, servers, routers, and switches",
      "Oversaw and supervised daily operations of fiber-optic technicians and project execution",
    ],
    tech: ["Networking", "Linux", "SNMP", "Fiber Optics"],
  },
];

export const projects: Project[] = [
  {
    slug: "kumanovo-transit",
    name: "Kumanovo Transit",
    featured: true,
    category: "Public Transport Web Platform",
    description:
      "A mobile-first platform that helps passengers explore Kumanovo's bus lines, stops, routes and timetables through a clear, accessible interface.",
    tags: ["Built for real users", "Mobile-first", "Real-world transportation data"],
    tech: ["React", "TypeScript", "Tailwind CSS", "Maps APIs"],
    live: "https://kumanovotranzit.com",
    github: "#",
    image: "/assets/kumanovo-transit.png",
    overview:
      "Kumanovo Transit gives passengers a single place to look up bus lines, stops, routes and timetables for the city's public transport network.",
    problem:
      "Local bus schedules and route information were scattered across paper timetables and word of mouth, leaving passengers without a reliable way to plan trips.",
    solution:
      "Designed and built a mobile-first web platform that presents lines, stops, routes and timetables through a clean, accessible interface backed by map integration.",
    role: "Designed and developed the platform end to end — data model, UI and map integration.",
    engineering: [
      "Mobile-first, accessible interface for browsing lines, stops and timetables",
      "Interactive route and stop visualization via Maps APIs",
      "Structured timetable data model for fast lookups",
    ],
    result: "Gives Kumanovo passengers a clear, single source for bus lines, routes and schedules.",
    architecture:
      "React/TypeScript frontend styled with Tailwind CSS, Maps APIs for route and stop visualization.",
    challenges:
      "Modeling real-world transit data — lines, directions, stop sequences and timetables — in a way that stays simple to navigate on a phone.",
    learned:
      "Deepened experience with accessible mobile-first UI and modeling transit data for clear presentation.",
  },
  {
    slug: "menucup",
    name: "MenuCup",
    featured: true,
    category: "SaaS Platform",
    description:
      "A digital menu SaaS platform that lets hospitality businesses create customizable menus accessible through QR codes, with menu management, themes, analytics and AI-powered recommendations.",
    tags: ["SaaS", "Multi-tenant", "QR menus"],
    tech: ["Node.js", "Next.js", "React", "PostgreSQL"],
    live: "https://menucup.com",
    github: "#",
    image: "/assets/menucup.png",
    overview:
      "MenuCup enables restaurants, cafes and bars to publish customizable digital menus that customers open by scanning a QR code.",
    problem:
      "Hospitality businesses needed an easy way to keep menus up to date and branded without reprinting, plus insight into what customers browse.",
    solution:
      "Built a SaaS platform with menu management, themeable layouts, browsing analytics and AI-powered item recommendations, all delivered through QR-code links.",
    role: "Designed and developed the platform — backend services, data model and frontend.",
    engineering: [
      "Multi-tenant menu management with themeable layouts",
      "Analytics pipeline tracking menu and item views",
      "AI-powered item recommendations",
      "QR-code generation tied to each venue's live menu",
    ],
    result: "Lets hospitality businesses run branded, always-current digital menus with usage insight.",
    architecture:
      "Next.js/React frontend, Node.js backend services, PostgreSQL for menu, tenant and analytics data.",
    challenges:
      "Designing a multi-tenant model where each venue gets custom theming and menu structure without fragmenting the codebase.",
    learned:
      "Improved skills in multi-tenant SaaS architecture and building analytics and recommendation features on top of product data.",
  },
  {
    slug: "cokolend",
    name: "Cokolend",
    featured: false,
    category: "E-commerce Web Platform",
    description:
      "A web platform for taking and delivering cake orders, built for the confectionery company Cokolend.",
    tags: ["Client project", "E-commerce"],
    tech: ["React", "Next.js", "PostgreSQL"],
    live: "#",
    github: "#",
    overview:
      "Cokolend is an ordering platform that lets customers browse the company's cake catalog and place delivery orders online.",
    problem:
      "Cokolend took cake orders manually over phone and social media, which was hard to track and easy to get wrong.",
    solution:
      "Designed and developed a web platform for browsing products, placing orders and coordinating delivery.",
    role: "Designed and developed the platform for the client.",
    engineering: [
      "Product catalog with per-item customization options",
      "Order intake and delivery scheduling workflow",
      "Admin view for managing incoming orders",
    ],
    result: "Replaced manual phone and social-media ordering with a single online flow.",
    architecture:
      "React/Next.js frontend, PostgreSQL for product and order data.",
    challenges:
      "Capturing custom cake requests in a structured order flow while keeping checkout simple for customers.",
    learned:
      "Practiced translating an informal business process into a structured ordering system.",
  },
  {
    slug: "custom-erp",
    name: "Custom ERP",
    featured: false,
    category: "Enterprise System",
    description:
      "A centralized digital ecosystem built to replace manual, paper-based record-keeping for the cultural association KUD Srpski Vez.",
    tags: ["Client project", "Internal system"],
    tech: ["C#", ".NET", "React", "SQL"],
    live: "#",
    github: "#",
    overview:
      "A custom ERP that consolidates the organization's records, members and operational documentation into one system.",
    problem:
      "KUD Srpski Vez relied on manual and paper-based record-keeping, creating high administrative overhead and scattered information.",
    solution:
      "Architected a centralized digital ecosystem covering records, membership and operational data, replacing the paper workflow.",
    role: "Architected and delivered the system for the client.",
    engineering: [
      "Centralized data model unifying previously siloed records",
      "Role-based access for different organizational functions",
      "Digitized workflows replacing paper forms and ledgers",
    ],
    result: "Cut administrative overhead by roughly 40% by replacing paper-based record-keeping.",
    architecture:
      "C#/.NET backend exposing a REST API, React frontend, relational SQL database.",
    challenges:
      "Mapping loosely defined manual processes onto a consistent data model without disrupting day-to-day operations.",
    learned:
      "Gained experience architecting a system from scratch around real organizational workflows.",
  },
];

export const github: GithubStats = {
  totalRepos: 32,
  totalContributions: 1284,
  streak: 46,
  recent: [
    { name: "kumanovo-transit", desc: "Public transport web platform", lang: "TypeScript" },
    { name: "menucup", desc: "Digital menu SaaS platform", lang: "TypeScript" },
    { name: "cokolend", desc: "Cake ordering & delivery platform", lang: "TypeScript" },
    { name: "custom-erp", desc: "Centralized ERP for a cultural association", lang: "C#" },
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
