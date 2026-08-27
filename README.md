# AJ.dev

Personal portfolio — Next.js (App Router) + TypeScript + CSS Modules.

## Running it

```bash
npm install
cp .env.example .env.local
npm run dev
```

Pages:

- `/` — the portfolio (hero terminal, projects, skills, architecture, experience, about, GitHub, contact)
- `/projects/[slug]` — project case study
- `/terminal` — full-screen terminal mode with the rating widget

Shortcuts: `⌘K` or `/` opens the command palette, `Esc` closes it. Both terminals
support command history (↑/↓) and tab completion.

## Where the data comes from

Everything the UI reads goes through `src/lib/api/content.ts`. With
`NEXT_PUBLIC_API_URL` unset it resolves to the sample content in
`src/lib/dummy-data.ts`; set it and the same functions call the backend, falling
back to the sample data if a request fails.

Expected endpoints:

| Function               | Endpoint              |
| ---------------------- | --------------------- |
| `getPersonal`          | `GET /personal`       |
| `getSkills`            | `GET /skills`         |
| `getExperience`        | `GET /experience`     |
| `getProjects`          | `GET /projects`       |
| `getProject(slug)`     | `GET /projects/:slug` |
| `getGithubStats`       | `GET /github`         |
| `getAboutCards`        | `GET /about-cards`    |
| `getArchitectureNodes` | `GET /architecture`   |

Response shapes are the types in `src/lib/types.ts`.

## Contact form

`POST /api/contact` sends the message through [Resend](https://resend.com). Set:

```
RESEND_API_KEY=re_...
CONTACT_TO_EMAIL=you@example.com
CONTACT_FROM_EMAIL="Portfolio <noreply@yourdomain.com>"
```

`CONTACT_FROM_EMAIL` must be a verified Resend sender. Without a key the route
logs the message in development and returns 503 in production. The terminal-mode
`/contact` flow posts to the same endpoint.

## Ratings

The terminal-mode widget stores ratings so their status can be tracked:

- `POST /api/ratings` — `{ score: 1-5, source }` → `{ id, score, createdAt }`
- `POST /api/ratings/feedback` — `{ id, feedback }` (only asked for on scores below 4)

`src/lib/server/ratings.ts` keeps them in memory for now. When
`NEXT_PUBLIC_API_URL` is set it forwards to `POST /ratings` and
`POST /ratings/:id/feedback` instead — otherwise replace the in-memory `store`
with a database call.

## Scripts

```bash
npm run dev        # dev server
npm run build      # production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```
