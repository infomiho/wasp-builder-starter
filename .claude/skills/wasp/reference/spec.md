# The spec: `main.wasp.ts` and `<feature>.wasp.ts`

Each feature declares its pages and operations in `src/<feature>/<feature>.wasp.ts`, exported as `const <feature>Spec: Spec = [...]`. `main.wasp.ts` holds the app settings and lists every feature spec in `spec: [...]`.

## Constructors

| Constructor | Arguments | Options |
| --- | --- | --- |
| `page(Component, options?)` | the imported component | `authRequired: true` sends visitors who are not signed in to `/login` and gives the component a `user` prop |
| `route(name, path, page(...), options?)` | a unique name ending in `Route`, the path, the `page(...)` call | `prerender: true` for a public page with fixed content (never with `authRequired`) |
| `query(fn, options?)`, `action(fn, options?)` | the imported function | `entities: ["Note"]`, `auth: false` for an operation that never needs the signed-in person |
| `api(method, path, fn, options?)` | `"GET"`, `"POST"`, `"PUT"`, `"PATCH"`, `"DELETE"`, `"HEAD"` or `"ALL"`, the path, the imported function | `entities`, `auth: false` for a public endpoint such as a webhook |
| `job(fn, options)` | the imported function | `executor: "PgBoss"` (required), `entities`, `schedule: { cron, args? }` |

- A query, action or job is named after the function passed. `query(getNotes)` creates the `getNotes` that React imports and the `GetNotes` type on the server. An API's type is its function name with a capital first letter (`ExportNotes`).
- Route names are unique across the app, and `routes.<Name>` in React comes from them.
- A path can hold a parameter (`/notes/:id`). The `"*"` route in `main.wasp.ts` is the not-found page.

## Imports in a spec file

```ts
import { NotesPage } from "./NotesPage" with { type: "ref" };   // code from src/: a reference
import { notesSpec } from "./src/notes/notes.wasp";              // another spec file: a normal import
import { APP_NAME } from "./src/shared/common";                  // a plain value used in the spec: a normal import
```

- `with { type: "ref" }` hands Wasp a pointer to the code without running it. Every component, operation, API, job, seed function, signup fields object and env schema is imported this way.
- A normal import runs the file, which works only for spec files and files of plain values. A component or an operations file imported that way fails the whole spec.
- The path is relative to the spec file and has no file extension. Imports are named, because this app has no default exports.

## Old habits that do not work here

| Old `main.wasp` language | Here |
| --- | --- |
| `query getNotes { fn: import { getNotes } from "@src/notes/operations", entities: [Note] }` | `query(getNotes, { entities: ["Note"] })` with a ref import at the top of the file |
| `query("getNotes", { fn: getNotes })` | `query(getNotes)`. No name string, no `fn` key |
| `page NotesPage { component: ... }` then `route NotesRoute { path: "/notes", to: NotesPage }` | `route("NotesRoute", "/notes", page(NotesPage))` |
| `api x { httpRoute: (GET, "/x"), fn: ... }` | `api("GET", "/x", fn)` |
| `job x { executor: PgBoss, perform: { fn: ... } }` | `job(fn, { executor: "PgBoss" })` |
| `entity Note {=psl ... psl=}` | a `model` in `schema.prisma` |
| `import { useQuery } from "@wasp/queries"`, `import getNotes from "@wasp/queries/getNotes"` | `import { getNotes, useQuery } from "wasp/client/operations"` |
| `import { Link, useParams } from "react-router-dom"` | `Link` from `wasp/client/router`, hooks from `react-router`. `react-router-dom` is not installed |
