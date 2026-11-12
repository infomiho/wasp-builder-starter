# What breaks the preview, and the fix

When the app breaks, the platform restarts it and sends you the problem with the end of the app's output. **Read that output first.** It names the file and the line. Find the matching message below, make that one fix, and stop. Retrying the same change, or rewriting the feature, does not help.

Three different checks exist, and each sees different mistakes:

| Check | Sees | Does not see |
| --- | --- | --- |
| `npx tsc -p tsconfig.src.json --noEmit` (you run it) | type errors in `src/`, wrong `wasp/...` imports, missing entities, links to unknown routes | anything in `*.wasp.ts`, a missing page file, server code imported into React |
| The spec compile (the running app does it when a `*.wasp.ts` file or `schema.prisma` changes) | every mistake in the spec and the schema | |
| The page loading in the preview | a missing page file, server code imported into React, runtime errors | |

The types under `wasp/...` are generated from the last spec that compiled. While the spec has an error they are stale, and `tsc` reports old news. Fix the spec error first.

## Spec errors (`Error while analyzing spec (*.wasp.ts) files`)

| Output | Cause | Fix |
| --- | --- | --- |
| `Argument of type 'string' is not assignable to parameter of type 'Reference<AnyFunction>'` at `query("getNotes", ...)` | a name string was passed, old style | `query(getNotes, { entities: ["Note"] })` with the function imported as a ref |
| `Argument of type 'SourceAwareRefObject' is not assignable to parameter of type 'Page'` | `route` got the component | wrap it: `route("NotesRoute", "/notes", page(NotesPage))` |
| ``Invalid `Entity` reference: `Notes` `` | the name in `entities` is not a model in `schema.prisma` | use the model's exact name, singular with a capital: `"Note"` |
| a long list of errors inside `src/**/*.tsx` such as `Property 'focus' does not exist on type 'HTMLInputElement'` or `Cannot find name 'window'` | a component was imported into the spec without `with { type: "ref" }` | add `with { type: "ref" }` to that import |
| `Error while analyzing the *.wasp.ts file` after `[unrun] Import failed` and `ERR_UNSUPPORTED_ESM_URL_SCHEME ... Received protocol 'virtual:'` | a server file (operations, APIs, jobs) was imported into the spec without `with { type: "ref" }` | add `with { type: "ref" }` to that import |
| `All definitions with the same name must produce the same configuration` | two routes share a name | give each route its own name |
| `Route '...' has prerendering enabled but its page has authRequired set to true` | `prerender: true` on a protected page | remove `prerender` |
| `Error while analyzing the *.wasp.ts file` after `[UNRESOLVED_IMPORT] Could not resolve './src/notes/note.wasp' in main.wasp.ts` | a spec file imports a path that does not exist | correct the path. A spec import has no `.ts` ending |
| no error, but nothing from a new feature exists | the feature spec is not listed in `main.wasp.ts` | import it and add it to `spec: [...]` |

## Type errors (`error TS...`)

| Output | Cause | Fix |
| --- | --- | --- |
| `.wasp/out/types/app/sdk/register.ts ... has no exported member 'getArchivedNotes'` | the spec imports a function its file does not export | export it under that exact name, or fix the name in the spec |
| `Module '"wasp/server/operations"' has no exported member 'GetNotes'` | the operation is not declared in a spec, the spec is not in `main.wasp.ts`, or the spec has an error | declare it, then check again. If you only just saved the spec, the types take a few seconds to appear |
| `Module '"wasp/client/operations"' has no exported member 'getNotes'` | same | same |
| `Property 'Note' does not exist on type '{}'` at `context.entities.Note` | the entity is missing from the operation's `entities` | add `entities: ["Note"]` in the spec |
| `Property 'user' does not exist on type '{ entities: ... }'` | the operation is declared with `auth: false` | remove `auth: false` |
| `Type '"/archive"' is not assignable to type '"/" \| "/login" \| ...'` at a `Link` | no route has that path | link to a path from the list, or declare the route first |
| `Property 'REACT_APP_X' does not exist on type` at `env.` | the variable is not in the env schema, or the schema is not registered in `main.wasp.ts` | [env.md](env.md) |
| `'required_error' does not exist in type` | zod 3 syntax | `z.string({ error: "..." })` |

## Errors that only the running app shows

| Output | Cause | Fix |
| --- | --- | --- |
| `Failed to resolve import "./src/notes/ArchivePage" from "routes.tsx". Does the file exist?` | the spec points at a page file that does not exist, or at the wrong path | create the file with that exported component, or correct the import in the spec |
| no error anywhere, but one page fails to open in the preview | the page file exists but exports another name than the spec imports. No check reports this | export the component under the exact name the spec imports |
| `Server code cannot be imported in the client code. Import from "wasp/server" in "src/notes/operations.ts" is not allowed.` | a React file imports that file (the message names the server file, not the React file that pulled it in) | find the React file importing it. Import operations from `wasp/client/operations`, and move shared schemas and constants to a file without `wasp/server` imports |
| `Env vars validation failed` when the server starts | a variable in the env schema is required and not set | make it `.optional()` and handle the missing value where it is used |
| `The table ... does not exist in the current database` or `The column ... does not exist` while you are still working | the schema changed and the platform migrates after your turn | nothing. Finish the change |
| `The database migration failed` with `Added the required column ... without a default value` | a new required field on a table with rows | make it optional or give it a default |
| `The database migration failed` with `Prisma Migrate has detected that the environment is non-interactive` | the change would drop or risk existing data: a rename, a removal, a type change, a new `@unique` | undo that part of the schema change and add a new field instead ([data.md](data.md)). Ignore the hint about `--create-only` |
| `Prisma schema validation` with `Type "..." is neither a built-in type, nor refers to another model` or another `schema.prisma` line | a mistake in `schema.prisma` | fix that line. The line number is for a generated copy of the schema, so find the field by its name |
| `Installing dependencies failed` | a package name or version in `package.json` does not exist, or is newer than 7 days | use a published version at least 7 days old |

## When the message is not here

1. Read the first error in the output, not the last. Later errors are often its consequences.
2. Open the file and line it names.
3. Compare what you wrote with [spec.md](spec.md) or [operations.md](operations.md).
4. If it is about a Wasp feature this skill does not cover, fetch the page for it from [docs.md](docs.md) before changing code.

Never run `wasp`, `prisma` or a server to investigate, and never edit `.wasp/` or `migrations/`.
