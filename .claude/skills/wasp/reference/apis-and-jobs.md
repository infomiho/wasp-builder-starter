# APIs, jobs and CRUD

Reach for these only when a query or action cannot do it. A page that reads or changes data needs a query or an action, nothing here.

## API: a plain HTTP endpoint

For a caller that is not this app's React code (a webhook from a payment service, a file download, a public feed).

```ts
// src/notes/notes.wasp.ts
import { api } from "@wasp.sh/spec";
import { exportNotes, notesHealth } from "./apis" with { type: "ref" };
// ...
  api("GET", "/api/notes/export", exportNotes, { entities: ["Note"] }),
  api("GET", "/api/notes/health", notesHealth, { auth: false }),
```

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
- It always answers through `res`. A handler that returns without answering leaves the request hanging.
- `auth: false` is for a caller with no session, such as a webhook. Its `context` has no `user`.
- The path is on the **server's** address, not the page's. Start it with `/api/` so it never looks like a page.
- From React, call it with the ready-made client, which adds the server address and the session:

```ts
import { api } from "wasp/client/api";

const exported = await api.get("/api/notes/export").json<{ notes: Note[] }>();
```

For streaming, raw request bodies (webhook signatures) or CORS for another site, fetch https://wasp.sh/docs/features/apis.md and https://wasp.sh/docs/advanced/server-customization/middleware.md first.

## Job: background or scheduled work

```ts
// src/notes/notes.wasp.ts
import { job } from "@wasp.sh/spec";
import { deleteOldNotes } from "./jobs" with { type: "ref" };
// ...
  job(deleteOldNotes, {
    executor: "PgBoss",
    entities: ["Note"],
    schedule: { cron: "0 3 * * *" },
  }),
```

```ts
// src/notes/jobs.ts
import type { DeleteOldNotes } from "wasp/server/jobs";

const NOTE_LIFETIME_DAYS = 90;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const deleteOldNotes: DeleteOldNotes<{}, void> = async (_args, context) => {
  const oldestKeptDate = new Date(Date.now() - NOTE_LIFETIME_DAYS * MS_PER_DAY);
  await context.entities.Note.deleteMany({
    where: { createdAt: { lt: oldestKeptDate } },
  });
};
```

- `executor: "PgBoss"` is required and the only choice. It keeps jobs in the app's own database, so nothing extra is needed.
- `schedule.cron` has five fields (`"0 3 * * *"` is every day at 03:00, `"0 * * * *"` every hour). Leave `schedule` out for a job that only runs when asked.
- The function is `async`, takes `(args, context)` and has `context.entities` but no user. The arguments are a plain object.
- Start one from an action or any server code:

```ts
import { deleteOldNotes } from "wasp/server/jobs";

await deleteOldNotes.submit({});
await deleteOldNotes.delay(60).submit({});   // in 60 seconds
```

- A job that calls an outside service catches the failure and a missing secret, logs it and returns, so one bad run does not crash anything.

More (retries, options): https://wasp.sh/docs/features/jobs.md

## CRUD: generated operations

`crud(...)` generates queries and actions for one entity. **Its defaults are not safe for this app**: the generated `getAll` returns every person's rows, and `get`, `update` and `delete` take any id. Writing the operations by hand, as the `feature-pattern` skill shows, is the default here. Use `crud` only with an `overrideFn` for every operation you turn on:

```ts
// src/notes/notes.wasp.ts
import { crud } from "@wasp.sh/spec";
import { createTag, getAllTags } from "./tags" with { type: "ref" };
// ...
  crud("Tags", "Tag", {
    getAll: { overrideFn: getAllTags },
    create: { overrideFn: createTag },
  }),
```

```ts
// src/notes/tags.ts
import type { Tag } from "wasp/entities";
import { HttpError } from "wasp/server";
import type { Tags } from "wasp/server/crud";

export const getAllTags: Tags.GetAllQuery<void, Tag[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  return context.entities.Tag.findMany({
    where: { userId: context.user.id },
    orderBy: { name: "asc" },
  });
};
```

```tsx
import { Tags } from "wasp/client/crud";

const { data: tags } = Tags.getAll.useQuery();
const createTag = Tags.create.useAction();
await createTag({ name: "Important" });
```

The override types are `Tags.GetAllQuery`, `Tags.GetQuery`, `Tags.CreateAction`, `Tags.UpdateAction` and `Tags.DeleteAction`, named after the first argument of `crud`. More: https://wasp.sh/docs/features/data/crud.md
