# Queries and actions

A query reads and an action changes something. Both run on the server and are called from React like functions. The worked example, with validation, the form and every state, is `.claude/skills/feature-pattern/example/notes/`.

## On the server

- **The type** is the function's name with a capital first letter, from `wasp/server/operations`: `getNotes` gives `GetNotes<Input, Output>`, with `void` for no input or output. It exists only after the operation is declared in a spec.
- **`context.user`** is the signed-in person or `undefined`. Wasp does not reject signed-out callers, so each operation starts with `if (!context.user) throw new HttpError(401)`.
- **`context.entities.Note`** is the Prisma API for that model. It holds only the entities the spec lists for the operation. Filtering by `userId: context.user.id` keeps people out of each other's rows.
- **Input** arrives unchecked from the browser. `ensureArgsSchemaOrThrowHttpError(schema, rawArgs)` returns the typed value or throws `HttpError(400)` with the schema's messages.
- **Errors**: `throw new HttpError(status, "Message for the person")` reaches React as `error.message`. Any other thrown error arrives as a bare 500 with no detail.
- **Values** that cross between server and browser are plain data, `Date`, `Map`, `Set` and Prisma rows. Functions and class instances do not survive.

A query for one row, which the example lacks:

```ts
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
```

## In React

- Operations come from `wasp/client/operations`. The feature's own `./operations` file is server code.
- `useQuery(query, args?, options?)`: `useQuery(getNote, { id }, { enabled: Boolean(id) })` waits for the id.
- An action is a plain async function: `await createNote({ title })` inside `try` and `catch`, so the form can show `error.message`. `useAction` is only for optimistic updates.
- After an action finishes, every query that lists one of the same entities fetches again. A list that stays stale means the action or the query is missing the entity in its `entities`.
