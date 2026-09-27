import type { PortfolioContent } from "@/lib/api/content";
import type { AskFaq, Job, Project } from "@/lib/types";
import type { TerminalLine } from "./types";
import { line } from "./types";

/**
 * The `/ask` assistant. There is no model behind it: a question is tokenized
 * and scored against the portfolio content (projects, jobs, tech) plus the
 * hand-written `askFaq` entries, and the best match builds the reply. It runs
 * entirely in the browser, so it costs nothing and needs no API or database.
 */

export type Ask = (question: string) => TerminalLine[];

/* ─────────────────────────── text matching ─────────────────────────── */

/** Words too common in names to identify anything on their own — they only count half. */
const GENERIC = new Set(
  [
    "portfolio",
    "management",
    "dashboard",
    "custom",
    "platform",
    "web",
    "system",
    "app",
    "project",
    "development",
    "contract",
    "net",
    "site",
    "website",
    "end",
    "the",
    "and",
    "for",
    "with",
    "device",
    "communication",
    "network",
    "inventory",
    "mapping",
  ].map(normalize),
);

/** Tech that collides with a regular question ("what's your github?"). */
const TECH_IGNORED = new Set(["github"]);

const TECH_ALIASES: Record<string, string[]> = {
  "c#": ["csharp", "c sharp"],
  ".net": ["dotnet", "dot net"],
  "next.js": ["nextjs"],
  "node.js": ["node", "nodejs"],
  postgresql: ["postgres", "psql"],
  javascript: ["js"],
  typescript: ["ts"],
  "ci/cd": ["cicd"],
  "pl/sql": ["plsql"],
};

function normalize(word: string) {
  const w = word.toLowerCase().replace(/[^a-z0-9#+]/g, "");
  if (w.length > 4 && w.endsWith("ies")) return `${w.slice(0, -3)}y`;
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/['’]s\b/g, "")
    .split(/[^a-z0-9#+.]+/)
    .map(normalize)
    .filter(Boolean);
}

/** Tokens for names, where "Breathe.mk" should also answer to "breathe". */
const nameTokens = (text: string) =>
  [...new Set([...tokenize(text), ...tokenize(text.replace(/\./g, " "))])].filter(
    (t) => t.length >= 3,
  );

const phrase = (text: string) => tokenize(text).join(" ");

type Query = { tokens: Set<string>; text: string };

function parse(question: string): Query {
  const words = tokenize(question);
  const tokens = new Set(words);
  // "menu cup" / "next js" should still find "menucup" / "nextjs".
  words.slice(1).forEach((w, i) => tokens.add(words[i] + w));
  return { tokens, text: ` ${words.join(" ")} ` };
}

function levenshtein(a: string, b: string) {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = row;
  }
  return prev[b.length];
}

/** Exact token match, forgiving a typo or two in longer words. */
function has(q: Query, word: string) {
  if (q.tokens.has(word)) return true;
  if (word.length < 6) return false;
  const allowed = word.length >= 9 ? 2 : 1;
  for (const t of q.tokens) {
    if (Math.abs(t.length - word.length) <= allowed && levenshtein(t, word) <= allowed) return true;
  }
  return false;
}

const hasPhrase = (q: Query, p: string) => p !== "" && q.text.includes(` ${p} `);

type Matcher = { words: string[]; phrases: string[] };

const matcher = (keywords: string[], phrases: string[] = []): Matcher => ({
  words: keywords.map(normalize),
  phrases: phrases.map(phrase),
});

function score(q: Query, m: Matcher) {
  let total = 0;
  for (const w of m.words) if (has(q, w)) total += 1;
  for (const p of m.phrases) if (hasPhrase(q, p)) total += 2;
  return total;
}

/** Scores a name: its full phrase is decisive, distinctive tokens count 1, generic ones ½. */
function nameScore(q: Query, names: string[], tokens: string[]) {
  if (names.some((n) => hasPhrase(q, n))) return 3;
  return tokens.reduce((sum, t) => (has(q, t) ? sum + (GENERIC.has(t) ? 0.5 : 1) : sum), 0);
}

const pick = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];
const hasLink = (url: string) => url !== "" && url !== "#";

/* ─────────────────────────── the assistant ─────────────────────────── */

const JOKES = [
  "Why do programmers prefer dark mode? Because light attracts bugs.",
  "I'd tell you a UDP joke, but you might not get it.",
  "There are 10 kinds of people: those who understand binary and those who don't.",
  "It works on my machine. Ship the machine.",
];

const FALLBACKS = [
  'Hmm, that one isn\'t in my training data yet — and by "training data" I mean a TypeScript file.',
  "404: answer not found. I'm the new intern here, still reading the docs.",
  "I've only existed for a few commits, so I don't know that one yet. Still learning!",
  "My brain is a handful of if-statements and a lot of hope. That question beat both.",
  "Still new here — I'll pretend I didn't see that and quietly add it to my study list.",
];

const ASPECTS: { key: keyof Project; m: Matcher }[] = [
  {
    key: "tech",
    m: matcher([
      "stack",
      "tech",
      "technology",
      "built",
      "build",
      "language",
      "framework",
      "made",
      "use",
    ]),
  },
  { key: "problem", m: matcher(["problem", "why", "purpose", "pain"]) },
  {
    key: "solution",
    m: matcher(["solution", "solve", "approach"], ["how does it work", "how it works"]),
  },
  { key: "engineering", m: matcher(["feature", "functionality", "capability"]) },
  { key: "architecture", m: matcher(["architecture", "structure", "design", "structured"]) },
  { key: "role", m: matcher(["role", "responsible", "contribution"], ["what did you do"]) },
  { key: "challenges", m: matcher(["challenge", "hard", "hardest", "difficult", "tricky"]) },
  { key: "learned", m: matcher(["learn", "learned", "lesson", "takeaway"]) },
  { key: "result", m: matcher(["result", "impact", "outcome", "success"]) },
  {
    key: "live",
    m: matcher(["live", "link", "url", "demo", "visit", "see", "try", "website", "online"]),
  },
  { key: "github", m: matcher(["github", "code", "source", "repo", "repository", "open"]) },
];

type Tech = { name: string; forms: string[] };

export function createAsk(content: PortfolioContent, faq: AskFaq[]): Ask {
  const { personal, projects, experience, skills, github, architecture } = content;

  /* knowledge built once from the content */

  const projectIndex = projects.map((p) => ({
    item: p,
    names: [phrase(p.name), phrase(p.slug.replace(/-/g, " "))],
    tokens: [
      ...new Set([
        ...nameTokens(p.name),
        ...nameTokens(p.slug.replace(/-/g, " ")),
        normalize(p.name),
      ]),
    ],
  }));

  const companyName = (job: Job) => job.company.replace(/\s*\(.*\)\s*/, "").trim();
  const companies = [...new Set(experience.map(companyName))].map((name) => ({
    item: experience.filter((j) => companyName(j) === name),
    names: [phrase(name)],
    tokens: [...new Set([...nameTokens(name.replace(/-/g, " ")), normalize(name)])],
  }));

  // Achievements like "Velnes.mk (Dec 2025 – Mar 2026): built ..." become askable too.
  const highlights = experience.flatMap((job) =>
    job.achievements.flatMap((text) => {
      const match = text.match(/^([^:(]{2,40}?)\s*(?:\(([^)]*)\))?\s*:\s*(.+)$/);
      if (!match) return [];
      const [, label, dates, detail] = match;
      return [
        {
          item: { job, label, dates, detail },
          names: [phrase(label)],
          tokens: nameTokens(label).filter((t) => !GENERIC.has(t)),
        },
      ];
    }),
  );

  const allTech = [
    ...skills.flatMap((s) => s.items),
    ...projects.flatMap((p) => p.tech),
    ...experience.flatMap((j) => j.tech),
  ];
  const techs: Tech[] = [...new Map(allTech.map((t) => [t.toLowerCase(), t])).values()]
    .filter((t) => !TECH_IGNORED.has(t.toLowerCase()))
    .map((name) => ({
      name,
      forms: [
        ...new Set(
          [name, name.replace(/\./g, " "), ...(TECH_ALIASES[name.toLowerCase()] ?? [])]
            .map(phrase)
            .filter(Boolean),
        ),
      ],
    }));

  /** "Tailwind" and "Tailwind CSS", ".NET" and ".NET Core" describe the same skill. */
  const related = (a: string, b: string) => {
    const [pa, pb] = [` ${phrase(a)} `, ` ${phrase(b)} `];
    return pa.includes(pb) || pb.includes(pa);
  };

  const startYear = Math.min(
    ...experience.map((j) => Number(j.dates.match(/\b(?:19|20)\d{2}\b/)?.[0] ?? Infinity)),
  );
  const years = Number.isFinite(startYear) ? new Date().getFullYear() - startYear : 0;
  const current = experience.filter((j) => /present/i.test(j.dates));
  const featured = projects.filter((p) => p.featured);
  const firstName = personal.name.split(" ")[0];

  /* replies */

  const projectLinks = (p: Project) => [
    ...(hasLink(p.live) ? [line(`live:  ${p.live}`, "accent", p.live)] : []),
    ...(hasLink(p.github) ? [line(`code:  ${p.github}`, "accent", p.github)] : []),
  ];

  function describeProject(p: Project, q: Query): TerminalLine[] {
    const aspects = ASPECTS.filter((a) => score(q, a.m) > 0).map((a) => a.key);

    if (!aspects.length) {
      return [
        line(`${p.name} — ${p.category}${p.featured ? "  [FEATURED]" : ""}`, "accent"),
        line(p.description, "secondary"),
        line(`stack: ${p.tech.join(", ")}`),
        ...projectLinks(p),
        line(`full case study: /project --${p.slug}`, "faint"),
      ];
    }

    const out: TerminalLine[] = [line(p.name, "accent")];
    for (const key of aspects) {
      if (key === "tech")
        out.push(line(`built with ${p.tech.join(", ")}.`, "secondary"), line(p.architecture));
      else if (key === "engineering") out.push(...p.engineering.map((e) => line(`  • ${e}`)));
      else if (key === "live")
        out.push(
          hasLink(p.live)
            ? line(`live at ${p.live}`, "accent", p.live)
            : line("no public link for this one — it's client or in-progress work.", "dim"),
        );
      else if (key === "github")
        out.push(
          hasLink(p.github)
            ? line(`source: ${p.github}`, "accent", p.github)
            : line("the code for this one is private, sorry.", "dim"),
        );
      else out.push(line(`${key}: ${p[key]}`, "secondary"));
    }
    return out;
  }

  const describeJob = (job: Job) => [
    line(`${job.role} @ ${job.company}  (${job.dates}) · ${job.location}`, "primary"),
    line(`  ${job.description}`, "secondary"),
    ...job.achievements.slice(0, 3).map((a) => line(`  • ${a}`)),
    line(`  stack: ${job.tech.join(", ")}`, "faint"),
  ];

  function describeTech(name: string): TerminalLine[] {
    const group = skills.find((s) => s.items.some((i) => related(i, name)));
    const inProjects = projects.filter((p) => p.tech.some((t) => related(t, name)));
    const inJobs = [
      ...new Set(
        experience.filter((j) => j.tech.some((t) => related(t, name))).map((j) => j.company),
      ),
    ];

    return [
      line(
        group
          ? `✓ ${name} — yes, it's part of my ${group.category} toolbox.`
          : `✓ ${name} — yes, I've worked with it.`,
        "success",
      ),
      ...(inProjects.length
        ? [line(`  projects: ${inProjects.map((p) => p.name).join(", ")}`)]
        : []),
      ...(inJobs.length ? [line(`  at work:  ${inJobs.join(", ")}`)] : []),
    ];
  }

  const intents: { m: Matcher; reply: () => TerminalLine[] }[] = [
    {
      m: matcher(
        ["who", "yourself", "introduce", "background", "bio", "summary", firstName],
        ["about you", "tell me about yourself"],
      ),
      reply: () => [
        line(`I'm ${personal.name}, a ${personal.role} from ${personal.location}.`, "primary"),
        ...(current.length
          ? [line(`Right now: ${current[0].role} @ ${current[0].company}.`, "secondary")]
          : []),
        ...(years
          ? [
              line(
                `${years} years in tech — from ${experience[experience.length - 1].role} to building full products end to end.`,
              ),
            ]
          : []),
        line("ask me about my projects, stack or experience.", "faint"),
      ],
    },
    {
      m: matcher(
        ["where", "location", "located", "based", "country", "city", "live"],
        ["where are you from"],
      ),
      reply: () => [
        line(`I'm based in ${personal.location}.`, "primary"),
        ...current.map((j) => line(`${j.company}: ${j.location}`, "secondary")),
      ],
    },
    {
      m: matcher(
        ["current", "currently", "now", "today", "position", "title", "employer"],
        ["what do you do", "where do you work"],
      ),
      reply: () =>
        current.length
          ? current.flatMap((j) => [
              line(`Currently ${j.role} @ ${j.company} (${j.dates}).`, "primary"),
              line(j.description, "secondary"),
            ])
          : [line(`${personal.role} — between roles right now.`, "primary")],
    },
    {
      m: matcher(
        [
          "experience",
          "career",
          "worked",
          "job",
          "companies",
          "company",
          "years",
          "history",
          "previous",
          "resume",
          "cv",
        ],
        ["work history"],
      ),
      reply: () => [
        line(
          `${years ? `${years}+ years` : "My experience"} across ${experience.length} roles:`,
          "primary",
        ),
        ...experience.map((j) => line(`  ${j.role} @ ${j.company}  (${j.dates})`, "secondary")),
        line(`full resume: ${personal.resume}`, "accent", personal.resume),
        line("ask about any company for details.", "faint"),
      ],
    },
    {
      m: matcher(
        [
          "skill",
          "stack",
          "tech",
          "technology",
          "tool",
          "language",
          "framework",
          "expertise",
          "strength",
          "strongest",
        ],
        ["good at"],
      ),
      reply: () => [
        ...skills.flatMap((g) => [
          line(`${g.category}:`, "accent"),
          line(`  ${g.items.join(", ")}`, "secondary"),
        ]),
        line('ask "do you know <tech>?" for specifics.', "faint"),
      ],
    },
    {
      m: matcher(["frontend", "backend", "fullstack", "prefer", "preference"], ["full stack"]),
      reply: () => [
        line(
          "Full-stack — I like owning the whole thing, from the database up to the UI.",
          "primary",
        ),
        ...skills
          .filter((g) => /backend|frontend|database/i.test(g.category))
          .map((g) => line(`  ${g.category}: ${g.items.join(", ")}`, "secondary")),
      ],
    },
    {
      m: matcher(
        ["project", "built", "build", "made", "apps", "work", "portfolio"],
        ["side project"],
      ),
      reply: () => [
        line(`${projects.length} projects so far:`, "primary"),
        ...projects.map((p) =>
          line(`  ${p.name} — ${p.category}${p.featured ? "  [FEATURED]" : ""}`, "secondary"),
        ),
        line("ask about any of them by name, e.g. what is menucup built with?", "faint"),
      ],
    },
    {
      m: matcher(
        ["proud", "proudest", "featured", "highlight", "coolest"],
        ["favorite project", "favourite project", "best project", "best work"],
      ),
      reply: () => [
        line("The ones I'm proudest of:", "primary"),
        ...featured.flatMap((p) => [
          line(`  ${p.name}`, "accent"),
          line(`    ${p.description}`, "secondary"),
        ]),
      ],
    },
    {
      m: matcher(
        [
          "contact",
          "email",
          "mail",
          "reach",
          "hire",
          "hiring",
          "available",
          "freelance",
          "collaborate",
          "touch",
          "message",
          "talk",
        ],
        ["work together"],
      ),
      reply: () => [
        line(
          "Easiest way: type /cancel, then /contact — it sends me a message directly.",
          "primary",
        ),
        line(`email:    ${personal.email}`, "accent", `mailto:${personal.email}`),
        line(`linkedin: ${personal.linkedin}`, "accent", personal.linkedin),
      ],
    },
    {
      m: matcher(
        ["github", "repo", "repository", "contribution", "commit", "streak", "opensource"],
        ["open source"],
      ),
      reply: () => [
        line(`github: ${personal.github}`, "accent", personal.github),
        line(
          `${github.totalRepos} repos · ${github.totalContributions} contributions · ${github.streak}-day streak`,
          "secondary",
        ),
      ],
    },
    {
      m: matcher(["linkedin", "social"]),
      reply: () => [line(`linkedin: ${personal.linkedin}`, "accent", personal.linkedin)],
    },
    {
      m: matcher(
        ["architecture", "approach", "principle", "philosophy", "structure", "design"],
        ["how do you build"],
      ),
      reply: () => [
        line(
          `How I usually structure an app: ${architecture.map((n) => n.label).join(" → ")}`,
          "primary",
        ),
        ...architecture.map((n) => line(`  ${n.label}: ${n.details.join(", ")}`, "secondary")),
      ],
    },
    {
      m: matcher(["joke", "funny", "laugh", "bored"]),
      reply: () => [line(pick(JOKES), "secondary")],
    },
    {
      m: matcher(["thanks", "thank", "thx", "cheers", "appreciate", "awesome", "cool", "nice"]),
      reply: () => [
        line("Anytime! Ask me something else, or /cancel to go back to commands.", "primary"),
      ],
    },
    {
      // Last, so "hey, what's your stack?" answers the stack.
      m: matcher(
        ["hi", "hello", "hey", "yo", "sup", "hola", "greetings", "howdy"],
        ["good morning", "good evening"],
      ),
      reply: () => [
        line(`Hey! 👋 I'm ${firstName} — well, a tiny terminal version of him.`, "primary"),
        line("Ask me about my projects, stack, experience, or how to reach me.", "secondary"),
      ],
    },
  ];

  const faqs = faq.map((f) => ({ m: matcher(f.keywords, f.phrases), answer: f.answer }));

  const fallback = () => [
    line(pick(FALLBACKS), "primary"),
    line(
      `try: "what's your stack?", "tell me about ${featured[0]?.name ?? projects[0]?.name ?? "your projects"}", "how can I contact you?"`,
      "faint",
    ),
  ];

  /* the actual lookup */

  return (question) => {
    const q = parse(question);
    if (!q.tokens.size) return fallback();

    const best = <T>(entries: { item: T; names: string[]; tokens: string[] }[]) =>
      entries
        .map((e) => ({ item: e.item, score: nameScore(q, e.names, e.tokens) }))
        .filter((e) => e.score >= 1)
        .sort((a, b) => b.score - a.score);

    const configured = faqs
      .map((f) => ({ f, score: score(q, f.m) }))
      .sort((a, b) => b.score - a.score)[0];
    if (configured && configured.score >= 2)
      return configured.f.answer.map((a) => line(a, "primary"));

    const matchedProjects = best(projectIndex);
    if (
      matchedProjects.length === 1 ||
      (matchedProjects.length > 1 && matchedProjects[0].score > matchedProjects[1].score)
    ) {
      return describeProject(matchedProjects[0].item, q);
    }
    if (matchedProjects.length > 1) {
      return [
        ...matchedProjects
          .slice(0, 3)
          .flatMap(({ item: p }) => [
            line(p.name, "accent"),
            line(`  ${p.description}`, "secondary"),
          ]),
        line("ask about one of them for details.", "faint"),
      ];
    }

    const highlight = best(highlights)[0];
    if (highlight) {
      const { job, label, dates, detail } = highlight.item;
      return [
        line(`${label}${dates ? ` (${dates})` : ""}`, "accent"),
        line(`  ${detail.charAt(0).toUpperCase()}${detail.slice(1)}.`, "secondary"),
        line(`  — as ${job.role} @ ${job.company}`, "faint"),
      ];
    }

    const company = best(companies)[0];
    if (company) return company.item.flatMap(describeJob);

    const matchedTech = techs.filter((t) =>
      t.forms.some((f) => (f.includes(" ") ? hasPhrase(q, f) : has(q, f))),
    );
    const distinctTech = matchedTech.filter(
      (t) =>
        !matchedTech.some(
          (o) => o !== t && o.name.length > t.name.length && related(o.name, t.name),
        ),
    );
    if (distinctTech.length) return distinctTech.slice(0, 3).flatMap((t) => describeTech(t.name));

    const candidates = [
      ...(configured
        ? [
            {
              score: configured.score + 0.5,
              reply: () => configured.f.answer.map((a) => line(a, "primary")),
            },
          ]
        : []),
      ...intents.map((i) => ({ score: score(q, i.m), reply: i.reply })),
    ];
    const winner = candidates.reduce((top, c) => (c.score > top.score ? c : top), {
      score: 0,
      reply: fallback,
    });
    return winner.score >= 1 ? winner.reply() : fallback();
  };
}
