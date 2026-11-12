---
name: wasp
description: How Wasp 0.26 works in this app, where the spec is TypeScript (`main.wasp.ts` and `<feature>.wasp.ts`), not the old `main.wasp` file. Use before you declare anything in a `*.wasp.ts` file, write a query, action, API or job, touch auth, env variables, routes or links, and when the app fails to start or the preview shows an error.
---

# Wasp in this app

This app uses Wasp 0.26 with a **TypeScript spec**. The Wasp you remember is most likely the old `main.wasp` language (`query getTasks { fn: import ... }`, `@src/...`, `route X { path: "/", to: Page }`), and none of it compiles here.

```ts
// src/notes/notes.wasp.ts
import { action, page, query, route, type Spec } from "@wasp.sh/spec";

import { NotesPage } from "./NotesPage" with { type: "ref" };
import { createNote, getNotes } from "./operations" with { type: "ref" };

export const notesSpec: Spec = [
  route("NotesRoute", "/notes", page(NotesPage, { authRequired: true })),
  query(getNotes, { entities: ["Note"] }),
  action(createNote, { entities: ["Note"] }),
];
```

## What breaks the preview

- Code from `src/` is imported into a spec with `with { type: "ref" }`, by a path relative to the spec file. A normal import runs the file and fails the whole spec. Only another spec file or a plain constant takes a normal import.
- `query`, `action`, `job` and `page` take the imported identifier, `route` takes `page(...)` as its third argument, and entities are strings (`["Note"]`).
- A feature spec that `main.wasp.ts` does not list in `spec: [...]` does not exist, and nothing reports it.
- A page file exports the exact name the spec imports. No check catches a mismatch, the page just fails to open.
- A file that React imports never reaches `wasp/server`, even through another file. What both sides share (zod schemas, constants) lives in a file without that import, like `validation.ts` in the feature pattern.
- Schema changes only add, because the migration runs unattended on tables that hold rows. A new field is optional or has a default. Renaming, removing or retyping a field fails the migration.
- Every env variable is optional in its schema. A required one that is missing stops the server from starting.
- `App.tsx` keeps its `<Outlet />` however the shell is reshaped. Every page renders inside it, so without it no page shows.

## Checking

`npx tsc -p tsconfig.src.json --noEmit` checks `src/` against the types generated from the last spec that compiled. It does not see the spec files, a missing page file or server imports in client code, and while the spec is broken it reports against stale types. Those mistakes show only in the app's own output, which the platform sends when the preview breaks. The first error in that output is the cause and later ones are usually its consequences. [reference/errors.md](reference/errors.md) lists each message with its fix. A database error in the preview mid-turn after a schema change needs no fix. The platform migrates when the turn ends.

## Where each import comes from

| You need | Import |
| --- | --- |
| `app`, `page`, `route`, `query`, `action`, `api`, `job`, `crud`, `type Spec` | `@wasp.sh/spec` (spec files only) |
| `GetNotes`, `CreateNote` (the type of each operation) | `wasp/server/operations` |
| `HttpError`, `env`, `prisma` | `wasp/server` |
| `Note`, `User` (entity types) | `wasp/entities` |
| `getNotes`, `createNote`, `useQuery` | `wasp/client/operations` |
| `useAuth`, `login`, `signup`, `logout` | `wasp/client/auth` |
| `Link`, `routes` | `wasp/client/router` |
| `useParams`, `useNavigate`, `Outlet` | `react-router` |
| `env` in React | `wasp/client` |
| `type AuthUser` | `wasp/auth` |

## Reference

| File | Open it when you |
| --- | --- |
| [reference/errors.md](reference/errors.md) | see an error from the app, the type check or the preview |
| [reference/spec.md](reference/spec.md) | declare a page, route, query, action, API or job. Has each constructor's arguments and the old habits to drop |
| [reference/operations.md](reference/operations.md) | write a query or action, or call one from React |
| [reference/data.md](reference/data.md) | change `schema.prisma` or read and write rows |
| [reference/auth.md](reference/auth.md) | protect a page, show the signed-in person, or are asked for email or social login |
| [reference/client.md](reference/client.md) | add a link, a page with an id in its address, an image or a `<head>` tag |
| [reference/env.md](reference/env.md) | need a secret or a setting from the environment, on the server or in React |
| [reference/apis-and-jobs.md](reference/apis-and-jobs.md) | need a plain HTTP endpoint (a webhook, a download), background or scheduled work, or consider `crud` |

For anything else, https://wasp.sh/llms-0.26.txt indexes every 0.26 documentation page as plain Markdown, and fetching the page beats guessing an API.

- The docs describe a generic Wasp app. Where they differ from this repository or `AGENTS.md`, the repository wins: a spec per feature, named exports, UUID ids, zod 4, no `wasp` or `prisma` commands. A page under `/docs/guides/legacy/` or an example with a `main.wasp` file describes the old language.
- The types generated for this app beat any page: `.wasp/spec/dist/src/spec/publicApi/waspSpec.d.ts` and `constructors.d.ts` for spec options, `.wasp/out/sdk/wasp/dist/` for everything under `wasp/...`.
