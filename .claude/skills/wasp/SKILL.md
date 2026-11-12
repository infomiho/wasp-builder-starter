---
name: wasp
description: How Wasp 0.26 works in this app, where the spec is TypeScript (`main.wasp.ts` and `<feature>.wasp.ts`), not the old `main.wasp` file. Use before you declare anything in a `*.wasp.ts` file, write a query, action, API or job, touch auth, env variables, routes or links, and when the app fails to start or the preview shows an error.
---

# Wasp in this app

This app uses Wasp 0.26.1 with a **TypeScript spec**. What you remember of Wasp is most likely the old `main.wasp` language (`query getTasks { fn: import ... }`, `@src/...`, `route X { path: "/", to: Page }`). None of it works here. Write what this page shows.

## The shape of every change

1. **Declare** it in the feature's spec, `src/<feature>/<feature>.wasp.ts`. `main.wasp.ts` only lists the feature specs.
2. **Implement** it in `src/<feature>/`, typed with the types Wasp generates from the declaration.
3. **Use** it from React through the `wasp/client/...` imports.

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

- Code from `src/` is imported into a spec file **with `with { type: "ref" }`**, by a path relative to that spec file. Another spec file (`./src/notes/notes.wasp`) or a plain constant is imported without it.
- `query`, `action`, `job` and `page` take the **imported identifier** first, never a name string or an `fn:` key. The operation's name is the identifier's name. Only `route` and `crud` start with a name string, and `api` starts with the method and path.
- `route` takes `page(...)` itself as its third argument.
- Entities are **strings**: `entities: ["Note"]`.
- A new feature spec is imported in `main.wasp.ts` and added to `spec: [...]`. Without that, nothing in it exists.

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

A file that React imports must never import `wasp/server...`, not even through another file. Keep what both sides share (zod schemas, constants) in a file with no `wasp/server` import, like `validation.ts` in the feature pattern.

## Rules that prevent most broken previews

- Every entity an operation touches through `context.entities` is listed in its `entities`. An action refreshes the queries that list the same entity, so a missing entity also means a stale list.
- `context.user` can be missing in every operation. Start with `if (!context.user) throw new HttpError(401)`.
- Call an action directly: `await createNote({ title })`. Only queries go through `useQuery`.
- A page file must exist with the exported name the spec imports. The type check does not catch a missing page.
- Write a schema change the database can take: a new field on an existing model is optional or has a default.

## Check your work

`npx tsc -p tsconfig.src.json --noEmit` checks `src/` against the types generated from the last spec that compiled. It does **not** check the spec files, missing page files or server imports in client code. Those show up only in the app's own output, which the platform sends you when the preview breaks. Read that error before changing anything: [reference/errors.md](reference/errors.md) lists each message with its fix.

## Reference

Open the file for the thing you are about to write.

| File | Open it when you |
| --- | --- |
| [reference/spec.md](reference/spec.md) | declare a page, route, query, action, API, job or CRUD, or change `main.wasp.ts`. Has every constructor and the old habits to drop |
| [reference/operations.md](reference/operations.md) | write a query or action, or call one from React |
| [reference/data.md](reference/data.md) | change `schema.prisma` or read and write rows |
| [reference/auth.md](reference/auth.md) | protect a page or operation, show the signed-in person, change where login leads, or are asked for email or social login |
| [reference/client.md](reference/client.md) | add a link, a page with an id in its address, an image or change the layout |
| [reference/env.md](reference/env.md) | need a secret or a setting from the environment, on the server or in React |
| [reference/apis-and-jobs.md](reference/apis-and-jobs.md) | need a plain HTTP endpoint (a webhook, a download) or work that runs in the background or on a schedule |
| [reference/errors.md](reference/errors.md) | see an error from the app, the type check or the preview |
| [reference/docs.md](reference/docs.md) | need something none of these cover. Lists the exact documentation URLs to fetch |

For a whole feature that stores data, copy the `feature-pattern` skill's example. This skill explains the Wasp parts underneath it.
