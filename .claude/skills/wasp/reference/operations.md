# Queries and actions

A query reads. An action changes something. Both run on the server and are called from React like functions.

## 1. Declare

```ts
// src/notes/notes.wasp.ts
import { createNote, deleteNote, getNote, getNotes } from "./operations" with { type: "ref" };
// ...
  query(getNotes, { entities: ["Note"] }),
  query(getNote, { entities: ["Note"] }),
  action(createNote, { entities: ["Note"] }),
  action(deleteNote, { entities: ["Note"] }),
```

List every entity the function reads or writes. `context.entities` holds only those.

## 2. Implement

```ts
// src/notes/operations.ts
import type { Note } from "wasp/entities";
import { HttpError } from "wasp/server";
import type { CreateNote, GetNote, GetNotes } from "wasp/server/operations";
import { ensureArgsSchemaOrThrowHttpError } from "../server/validation";
import { createNoteInputSchema, noteIdInputSchema, type CreateNoteInput, type NoteIdInput } from "./validation";

export const getNotes: GetNotes<void, Note[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  return context.entities.Note.findMany({
    where: { userId: context.user.id },
    orderBy: { createdAt: "desc" },
  });
};

export const getNote: GetNote<NoteIdInput, Note> = async (rawArgs, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const { id } = ensureArgsSchemaOrThrowHttpError(noteIdInputSchema, rawArgs);

  const note = await context.entities.Note.findFirst({
    where: { id, userId: context.user.id },
  });
  if (!note) {
    throw new HttpError(404, "This note no longer exists.");
  }
  return note;
};

export const createNote: CreateNote<CreateNoteInput, Note> = async (rawArgs, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const { title, content } = ensureArgsSchemaOrThrowHttpError(createNoteInputSchema, rawArgs);

  return context.entities.Note.create({
    data: { title, content, user: { connect: { id: context.user.id } } },
  });
};
```

```ts
// src/notes/validation.ts (no server imports, so the form can use it too)
import * as z from "zod";

export const createNoteInputSchema = z.object({
  title: z.string().trim().min(1, "Give the note a title.").max(120),
  content: z.string().trim().max(2000),
});
export type CreateNoteInput = z.infer<typeof createNoteInputSchema>;

export const noteIdInputSchema = z.object({ id: z.uuid() });
export type NoteIdInput = z.infer<typeof noteIdInputSchema>;
```

- **The type** is the function's name with a capital first letter, from `wasp/server/operations`: `getNotes` gives `GetNotes<Input, Output>`. It exists only after the operation is declared in a spec. Use `void` for no input or no output.
- **`context.user`** is the signed-in person or `undefined`. It holds the `User` fields (`id`, `username`, `createdAt` and any you add), never a password. Wasp does not reject signed-out callers for you. Check it first in every operation.
- **`context.entities.Note`** is the Prisma API for that model (`findMany`, `findFirst`, `create`, `update`, `updateMany`, `deleteMany`, `count`). Always filter by `userId: context.user.id` so nobody reaches another person's rows.
- **Input** arrives unchecked from the browser. Pass it through `ensureArgsSchemaOrThrowHttpError(schema, rawArgs)`, which returns the typed value or throws `HttpError(400)` with the schema's messages.
- **Errors**: `throw new HttpError(status, "Message for the person")`. React receives it as `error.message`. Any other thrown error reaches the browser as a bare 500 with no detail, so turn every failure the person should understand into an `HttpError`.
- **Values** that travel between server and browser can be plain data, `Date`, `Map`, `Set` and Prisma rows. Functions and class instances cannot.

## 3. Call from React

```tsx
import { createNote, getNotes, useQuery } from "wasp/client/operations";

function NoteList() {
  const { data: notes, isLoading, error } = useQuery(getNotes);

  if (isLoading) return <p className="text-muted-foreground">Loading notes…</p>;
  if (error) return <p className="text-destructive">{error.message}</p>;
  if (!notes || notes.length === 0) return <p className="text-muted-foreground">No notes yet.</p>;

  return <ul>{notes.map((note) => <li key={note.id}>{note.title}</li>)}</ul>;
}

async function addNote(title: string) {
  await createNote({ title, content: "" });
}
```

- `useQuery(query, args?, options?)`: `useQuery(getNote, { id })`. To wait for a value, pass `{ enabled: Boolean(id) }` as the third argument.
- An action is a plain async function: `await createNote({...})` inside a handler, in `try` and `catch` so the form can show `error.message`. `useAction` exists only for optimistic updates. Skip it.
- Types flow from the server function. Never write the result type again in React.
- **Refreshing is automatic.** After an action finishes, every query that lists one of the same entities fetches again. No manual refetch, no state copy of the list. When a list stays stale, the action or the query is missing the entity in its `entities`.

## Mistakes to avoid

| Mistake | What happens |
| --- | --- |
| Operation written but not declared in a spec | `wasp/server/operations` has no exported member `GetNotes`, and `wasp/client/operations` has no `getNotes` |
| Declared but not exported from the file, or exported under another name | type check fails in `.wasp/out/types/app/sdk/register.ts`: `has no exported member` |
| Entity missing from `entities` | `Property 'Note' does not exist on type '{}'` |
| React file imports `./operations` or `wasp/server` | preview fails: `Server code cannot be imported in the client code` |
| Importing the operation into React from `./operations` instead of `wasp/client/operations` | same error. The client version always comes from `wasp/client/operations` |
| Using `@prisma/client` in an operation to reach the database | works but skips the entity list, so queries do not refresh. Use `context.entities` |

The complete worked feature, with the form and all its states, is `.claude/skills/feature-pattern/example/notes/`.
