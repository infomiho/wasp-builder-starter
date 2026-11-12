# APIs, jobs and CRUD

A page that reads or changes data needs a query or an action. These are for what those cannot do.

## API: a plain HTTP endpoint

For a caller that is not this app's React code: a webhook, a file download, a public feed. Declared as `api("GET", "/api/notes/export", exportNotes, { entities: ["Note"] })`, or with `{ auth: false }` for a caller with no session.

```ts
// src/notes/apis.ts
import type { ExportNotes, NotesHealth } from "wasp/server/api";

export const exportNotes: ExportNotes = async (_req, res, context) => {
  if (!context.user) {
    res.status(401).json({ message: "Log in to export your notes." });
    return;
  }

  const notes = await context.entities.Note.findMany({
    where: { userId: context.user.id },
  });
  res.json({ notes });
};

export const notesHealth: NotesHealth = (_req, res) => {
  res.json({ ok: true });
};
```

- The handler is an Express handler with a third argument, `context`, holding `user` and `entities` like an operation. Its type is the function name with a capital first letter, from `wasp/server/api`.
- A handler that returns without answering through `res` leaves the request hanging.
- The path is on the server's address, not the page's. A `/api/` prefix keeps it from looking like a page.
- React calls it with the ready-made client, which adds the server address and the session: `await api.get("/api/notes/export").json<{ notes: Note[] }>()` with `import { api } from "wasp/client/api"`.
- Streaming, raw request bodies (webhook signatures) and CORS: https://wasp.sh/docs/features/apis.md and https://wasp.sh/docs/advanced/server-customization/middleware.md

## Job: background or scheduled work

- Declared as `job(deleteOldNotes, { executor: "PgBoss", entities: ["Note"], schedule: { cron: "0 3 * * *" } })`. `PgBoss` is required and the only executor. It keeps jobs in the app's own database.
- `schedule.cron` has five fields (`"0 3 * * *"` is every day at 03:00). Without `schedule` the job runs only when asked.
- The function is `export const deleteOldNotes: DeleteOldNotes<{}, void> = async (_args, context) => { ... }`, typed from `wasp/server/jobs`. It has `context.entities` but no user, and its arguments are a plain object.
- Server code starts one with `import { deleteOldNotes } from "wasp/server/jobs"`, then `await deleteOldNotes.submit({})` or `await deleteOldNotes.delay(60).submit({})` for 60 seconds later.
- Retries and options: https://wasp.sh/docs/features/jobs.md

## CRUD

`crud(...)` generates operations for one entity, and its defaults are unsafe here: `getAll` returns everyone's rows, and `get`, `update` and `delete` take any id. Operations written by hand, as in the `feature-pattern` skill, are the safe default. Overrides: https://wasp.sh/docs/features/data/crud.md
