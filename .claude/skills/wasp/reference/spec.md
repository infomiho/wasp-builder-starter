# The spec: `main.wasp.ts` and `<feature>.wasp.ts`

The spec tells Wasp what the app has. `main.wasp.ts` holds the app settings and lists the feature specs. Each feature declares its own pages and operations in `src/<feature>/<feature>.wasp.ts`.

## A feature spec with everything in it

```ts
// src/notes/notes.wasp.ts
import { action, api, crud, job, page, query, route, type Spec } from "@wasp.sh/spec";

import { exportNotes } from "./apis" with { type: "ref" };
import { deleteOldNotes } from "./jobs" with { type: "ref" };
import { NotePage } from "./NotePage" with { type: "ref" };
import { NotesPage } from "./NotesPage" with { type: "ref" };
import { createNote, deleteNote, getNote, getNotes } from "./operations" with { type: "ref" };
import { createTag, getAllTags } from "./tags" with { type: "ref" };

export const notesSpec: Spec = [
  route("NotesRoute", "/notes", page(NotesPage, { authRequired: true })),
  route("NoteRoute", "/notes/:id", page(NotePage, { authRequired: true })),
  query(getNotes, { entities: ["Note"] }),
  query(getNote, { entities: ["Note"] }),
  action(createNote, { entities: ["Note"] }),
  action(deleteNote, { entities: ["Note"] }),
  api("GET", "/api/notes/export", exportNotes, { entities: ["Note"] }),
  job(deleteOldNotes, {
    executor: "PgBoss",
    entities: ["Note"],
    schedule: { cron: "0 3 * * *" },
  }),
  crud("Tags", "Tag", {
    getAll: { overrideFn: getAllTags },
    create: { overrideFn: createTag },
  }),
];
```

Then in `main.wasp.ts`, next to the other feature specs:

```ts
import { notesSpec } from "./src/notes/notes.wasp";
// ...
  spec: [
    // existing entries stay
    notesSpec,
  ],
```

## Each constructor

| Constructor | Arguments | Options |
| --- | --- | --- |
| `page(Component, options?)` | the imported component | `authRequired: true` sends visitors who are not signed in to `/login` and gives the component a `user` prop |
| `route(name, path, page(...), options?)` | a unique name ending in `Route`, the path, the `page(...)` call | `prerender: true` for a public page with fixed content (never with `authRequired`), `lazy: false` |
| `query(fn, options?)` | the imported function | `entities: ["Note"]`, `auth: false` for an operation that never needs the signed-in person |
| `action(fn, options?)` | the imported function | same as `query` |
| `api(method, path, fn, options?)` | `"GET"`, `"POST"`, `"PUT"`, `"PATCH"`, `"DELETE"`, `"HEAD"` or `"ALL"`, the path, the imported function | `entities`, `auth: false` for a public endpoint such as a webhook |
| `job(fn, options)` | the imported function | `executor: "PgBoss"` (required), `entities`, `schedule: { cron, args? }` |
| `crud(name, entity, operations)` | a name, the entity name as a string, which of `get`, `getAll`, `create`, `update`, `delete` to turn on | per operation `{ overrideFn }`. The generated defaults (`{}`) are not safe here, see [apis-and-jobs.md](apis-and-jobs.md) |

- The name of a query, action or job is the name of the function you pass. `query(getNotes)` creates the `getNotes` you import in React and the `GetNotes` type on the server. An API's type is its function name with a capital first letter (`ExportNotes`).
- Route names are unique across the whole app. `routes.<Name>` in React comes from the route name.
- A path can hold a parameter (`/notes/:id`). The `"*"` route in `main.wasp.ts` is the not-found page, shown for any address no other route matches.
- A `page(...)` only exists inside a `route(...)`.

## Imports in a spec file

```ts
import { NotesPage } from "./NotesPage" with { type: "ref" };   // code from src/: a reference
import { notesSpec } from "./src/notes/notes.wasp";              // another spec file: a normal import
import { APP_NAME } from "./src/shared/common";                  // a plain value used in the spec: a normal import
```

- `with { type: "ref" }` hands Wasp a pointer to your code without running it. Use it for every component, operation, API, job, seed function, signup fields object and env schema.
- The path is relative to the spec file it is written in and ends inside `src/`. No file extension.
- Use named imports. This app exports components and operations by name (`export function NotesPage`), not as default exports.
- A normal import runs the file. Import only spec files and files with plain values that way (`src/shared/common.ts`). A normal import of a component or an operations file fails the whole spec.
- A spec file's name ends in `.wasp.ts`. It exports `const <feature>Spec: Spec = [...]`.

## `main.wasp.ts`

`app({...})` is the default export and is called once. The settings this app uses:

| Field | What it holds |
| --- | --- |
| `name` | internal identifier, leave it |
| `wasp: { version }` | the Wasp version, leave it |
| `title`, `head` | the tab title (`APP_NAME`) and extra `<head>` tags, kept in `src/client/head.wasp.ts` |
| `auth` | `authConfig` from `src/auth/auth.wasp.ts` ([auth.md](auth.md)) |
| `db: { seeds: [...] }` | seed functions, imported as refs |
| `client: { rootComponent }` | `App`, the one layout every page renders in. Also `envValidationSchema` ([env.md](env.md)) |
| `server: { envValidationSchema }` | the server env schema, when the app has one ([env.md](env.md)) |
| `spec: [...]` | routes declared here plus every feature spec. Arrays can nest |

## Old habits that do not work here

| Old `main.wasp` language | Here |
| --- | --- |
| a file named `main.wasp` | `main.wasp.ts` and `src/<feature>/<feature>.wasp.ts` |
| `query getNotes { fn: import { getNotes } from "@src/notes/operations", entities: [Note] }` | `query(getNotes, { entities: ["Note"] })` with a ref import at the top of the file |
| `query("getNotes", { fn: getNotes })` | `query(getNotes)`. No name string, no `fn` key |
| `import ... from "@src/..."` | a relative path with `with { type: "ref" }` |
| `entities: [Note]` | `entities: ["Note"]` |
| `page NotesPage { component: ... }` then `route NotesRoute { path: "/notes", to: NotesPage }` | `route("NotesRoute", "/notes", page(NotesPage))` |
| `api x { httpRoute: (GET, "/x"), fn: ... }` | `api("GET", "/x", fn)` |
| `job x { executor: PgBoss, perform: { fn: ... } }` | `job(fn, { executor: "PgBoss" })` |
| `entity Note {=psl ... psl=}` | a `model` in `schema.prisma` |
| `import { useQuery } from "@wasp/queries"`, `import getNotes from "@wasp/queries/getNotes"` | `import { getNotes, useQuery } from "wasp/client/operations"` |
| `import HttpError from "@wasp/core/HttpError"` | `import { HttpError } from "wasp/server"` |
| `import { Link, useParams } from "react-router-dom"` | `Link` from `wasp/client/router`, hooks from `react-router`. `react-router-dom` is not installed |

The full type of every field is in `.wasp/spec/dist/src/spec/publicApi/waspSpec.d.ts` and `constructors.d.ts`. Read those before guessing an option name.
