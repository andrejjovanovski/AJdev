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
`src/lib/dummy-data.ts`; set it (to the **AJdevBackendApi** .NET project, e.g.
`http://localhost:5084`) and profile, experience and projects come from the
backend, falling back to the sample data if a request fails.

`src/lib/api/backend-map.ts` maps the backend's responses (camelCase entities,
comma-joined strings, a nested `caseStudy`) onto the types in
`src/lib/types.ts`.

| Function               | Backend endpoint                    | Source          |
| ---------------------- | ----------------------------------- | --------------- |
| `getPersonal`          | `GET /api/GeneralInformation`       | backend         |
| `getExperience`        | `GET /api/Experience`               | backend         |
| `getProjects`          | `GET /api/Project`                  | backend         |
| `getProject(slug)`     | `GET /api/Project/by-slug/{slug}`   | backend         |
| `getSkills`            | —                                   | dummy data      |
| `getGithubStats`       | —                                   | dummy data      |
| `getAboutCards`        | —                                   | dummy data      |
| `getArchitectureNodes` | —                                   | dummy data      |

All calls happen server-side (server components / route handlers). Project
images referenced with a server-relative path are served from the backend origin,
so that host is added to `next.config.ts` `images.remotePatterns` when
`NEXT_PUBLIC_API_URL` is set.

## /portal — content admin

`/portal` signs in against the backend admin user
(`AppSettings:AdminUsername` / `AppSettings:AdminPassword` in AJdevBackendApi).
`POST /api/Auth/login` returns a JWT that is carried inside the signed session
cookie (`PORTAL_SESSION_SECRET` signs the cookie). The session lasts as long as
the backend token (~1 day), then bounces to the login page.

Saving fans out to the backend: profile → `PUT /api/GeneralInformation`,
projects → `POST/PUT/DELETE /api/Project/*`, experience → `POST/PUT/DELETE
/api/Experience/*`. Skills, the stats strip, terminal copy and theme/accent
settings have no backend table yet, so they live in an in-memory store
(`src/lib/server/portal-content.ts`, resets on server restart) and are not
reflected on the public pages.

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

`src/lib/server/ratings.ts` keeps them in memory — the backend has no ratings
endpoint yet, so they are not forwarded. Replace the in-memory `store` with a
database call when they need to persist.

## Scripts

```bash
npm run dev        # dev server
npm run build      # production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```
