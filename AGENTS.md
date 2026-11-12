# My app

A small full-stack app on [Wasp](https://wasp.sh) 0.26 (React, Node.js, Prisma, PostgreSQL), started from [Open SaaS](https://github.com/wasp-lang/open-saas) stripped to its core. The person asking for changes may not code: they describe what they want in chat and watch the app in a live preview. Every change should leave the preview working and looking finished.

## Ground rules

- **The platform runs everything.** It starts the database and the servers, installs dependencies and creates and applies migrations. Never run `wasp` or `prisma` commands, and never start servers. To check your work, run `npx tsc -p tsconfig.src.json --noEmit` and read the preview.
- **Migrations follow the schema.** Change `schema.prisma`, and the platform generates a new migration from it. Never write or edit files in `migrations/`. A new field on an existing model needs a default value or must be optional (`?`), so the migration applies to tables that already have rows.
- **Ids are UUIDs.** Every model's id is `String @id @default(uuid())` and every foreign key that points at one is a `String`, never an autoincrementing integer. Ids appear in addresses (`/bookings/<id>`), and an integer one reveals how many records exist and lets a visitor guess the next one. Validate every id that arrives as operation input or in an address with `z.uuid()`.
- **Small, focused changes.** Do what was asked, in the files it needs. Leave unrelated code as it is, and remove anything your change made unused: imports, files, routes, dependencies.
- **Build from the UI kit and the theme.** Compose pages from `src/client/components/ui` (shadcn/ui) and `lucide-react` icons. Color with the theme tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `border-border`, `bg-muted`, `text-destructive`) so light and dark mode both work. A hardcoded color (`bg-white`, `text-gray-900`, hex values) breaks dark mode.
- **Dependencies are a last resort.** Use what `package.json` already has. When a package is truly needed, add it to `package.json` and explain why. `.npmrc` only accepts versions published at least 7 days ago.
- **Secrets never block the app.** Declare each one as optional in the zod schema in `src/env.ts`, registered in `main.wasp.ts` as `server: { envValidationSchema }` (the building block skills show how), and read it with `env` from `wasp/server`. When one is missing, the feature still loads and tells the person in plain words what to set up, and the rest of the app keeps working. Keep secrets out of code and out of committed files: they live in the platform's environment settings, or in `.env.server`, which git ignores.
- **Write for the person.** Interface text is short, plain and in sentence case. Every list has a loading, an empty and an error state.
- **One shell.** The starter's name (`src/shared/common.ts`), landing page, navigation bar and footer are placeholders. When you build the person's app, replace or reshape them into the app's own shell: rename it, rewrite the landing page for it, and turn `NavBar` and `App.tsx` into the navigation and layout the app needs, such as a sidebar. Never build a second header, sidebar or layout beside the existing one, because both then show at once and the starter's bar floats over the app's.
- **Off limits:** `AGENTS.md`, `CLAUDE.md`, `.claude/`, `.github/`, `migrations/`, `.wasp/`, `package-lock.json`.

## Project map

| Path | What it is |
| --- | --- |
| `main.wasp.ts` | The app spec: name, auth, seeds, and the list of feature specs it combines |
| `schema.prisma` | Database models (Wasp calls them entities) |
| `src/shared/common.ts` | The app's name and one-line description |
| `src/client/App.tsx` | Root layout, the one shell every page renders in: navigation bar, color mode, toasts |
| `src/client/Main.css` | Tailwind setup and the theme colors |
| `src/client/components/ui/` | The UI kit (shadcn/ui, Open SaaS style) |
| `src/client/components/NavBar/` | Top navigation, `constants.ts` lists its links |
| `src/landing-page/` | Public home page at `/` (hero, features, footer) |
| `src/auth/` | Login and signup pages, auth config in `auth.wasp.ts` |
| `src/user/` | Account page and the user menu (`constants.ts` lists its links) |
| `src/server/validation.ts` | `ensureArgsSchemaOrThrowHttpError` for validating operation input |
| `src/shared/format.ts` | `formatDate` and `formatDateTime` for showing dates |
| `src/server/scripts/dbSeeds.ts` | Demo data created by the seed |
| `.claude/skills/feature-pattern/` | The pattern for a feature that stores data, with a complete example to copy |

Each feature lives in its own folder with a `<feature>.wasp.ts` spec that `main.wasp.ts` lists in `spec: [...]`.

## Recipes

For any feature that stores data, follow the `feature-pattern` skill (`.claude/skills/feature-pattern/SKILL.md`). Its `example/notes/` folder is the reference for all of these. Copy its shape.

- **Entity:** add a model to `schema.prisma` with `id String @id @default(uuid())`, `createdAt DateTime @default(now())` and, when it belongs to a user, `user User @relation(fields: [userId], references: [id], onDelete: Cascade)` plus `userId String`. Add the back relation (`bookings Booking[]`) to `User`.
- **Query and action:** write them in `src/<feature>/operations.ts`, typed with the generated types from `wasp/server/operations`. Each one starts with `if (!context.user) throw new HttpError(401)`, validates input with a zod schema through `ensureArgsSchemaOrThrowHttpError`, and only reads or changes rows of `context.user`. Declare them in `<feature>.wasp.ts` with `query(...)` or `action(...)` and the entities they touch.
- **Page and route:** a component in `src/<feature>/<Name>Page.tsx`, declared with `route("<Name>Route", "/path", page(<Name>Page, { authRequired: true }))`. Call operations from the page through `wasp/client/operations` (`useQuery(getBookings)`, `await createBooking(...)`). Wasp refreshes queries that use the same entity after an action. Forms check input with the same zod schema before calling the action and show each message under its field (`NewNoteForm` in the example's `NotesPage.tsx`).
- **Navigation:** add `{ name, to: routes.<Name>Route.to }` to `src/client/components/NavBar/constants.ts`. Account-related links go in `src/user/constants.ts`.
- **New feature spec:** import its spec in `main.wasp.ts` and add it to `spec: [...]`.

After signing in, people land on the landing page, because the starter has no page of its own yet. Once the app has a main page, send them there: update `onAuthSucceededRedirectTo` in `src/auth/auth.wasp.ts`, `useRedirectIfLoggedIn`, the login and signup pages and the hero's signed-in button.

## Name, theme and auth

- **Rename the app:** change `APP_NAME` (and `APP_DESCRIPTION`) in `src/shared/common.ts`. The tab title, navigation, landing page, login and footer all read it. Keep `name` in `main.wasp.ts` as it is: it is an internal identifier.
- **Theme:** the colors are CSS variables in `src/client/Main.css` (`:root` for light, `.dark` for dark). Change those values to restyle the app.
- **Auth:** username and password, which needs no email service or secrets. Protect a page with `authRequired: true`, and it receives the signed-in `user` as a prop. The seed creates the demo user from `src/shared/demoUser.ts`, shown on the login page in development.

## Building blocks

Bigger features from Open SaaS, removed to keep the starter small, come back as skills in `.claude/skills/blocks/`. When the person asks for one of these, follow its skill:

| Block | Use when the person wants |
| --- | --- |
| `payments` | to charge money: subscriptions, one-time purchases, credits, a pricing page |
| `file-upload` | people to upload, store and download files or images |
| `admin-dashboard` | an admin area to see and manage users |
| `analytics` | visitor statistics (Plausible or Google Analytics) |
| `landing-page` | a full marketing page: feature grid, testimonials, FAQ, examples, richer footer |
| `ai-example` | an AI feature built on OpenAI |

## Before you finish

Run the `review` skill (`.claude/skills/review/SKILL.md`) on your change and fix what it finds.

## Documentation

- Wasp: fetch the [llms.txt index](https://wasp.sh/llms.txt) and read the pages for the task. This app uses Wasp 0.26 with a TypeScript spec (`main.wasp.ts`).
- Open SaaS: fetch the [llms.txt index](https://docs.opensaas.sh/llms.txt) and the raw.githubusercontent.com guide URLs it lists. Its guides describe the full template, so check the building block skill for how a feature fits this smaller app.
