---
name: feature-pattern
description: The pattern for a feature that stores data in this Wasp app, with a complete example to copy: a model, queries and actions with validation, a page with loading, empty and error states, a nav link and seed data. Use every time you add such a feature.
---

# Feature pattern

`example/notes/` in this folder is a complete feature: people write notes and see their own list. It is a reference, not part of the app. Copy it to `src/<feature>/`, then rename every `Note`, `note` and `notes` to the thing the person's app stores (`Booking`, `booking`, `bookings`). Its imports are written for `src/<feature>/`, so they resolve once it is there.

| Example file | What to take from it |
| --- | --- |
| `validation.ts` | One zod schema per action input, with length limits as constants and messages written for the person. The server and the form both use it |
| `operations.ts` | Each operation checks `context.user`, validates through `ensureArgsSchemaOrThrowHttpError` and touches only the signed-in user's rows |
| `notes.wasp.ts` | The feature spec: one route with `authRequired: true`, and each operation with the entities it uses |
| `NotesPage.tsx` | A form that checks input before calling the action and shows each message under its field, and a list with loading, empty and error states |

## 1. Model

Add the model to `schema.prisma`, and its back relation to `User`. The example's model:

```prisma
model User {
  // existing fields stay
  notes                     Note[]
}

model Note {
  id                        String          @id @default(uuid())
  createdAt                 DateTime        @default(now())

  user                      User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId                    String

  title                     String
  content                   String          @default("")
}
```

The platform generates and applies the migration.

## 2. Validation, operations and spec

Copy `validation.ts`, `operations.ts` and `notes.wasp.ts` (as `<feature>.wasp.ts`) and reshape them for your model: its fields, its limits, its messages. Add an operation for each thing the person can do (edit, delete, mark as done), in the same shape as `createNote`. An operation that changes one row finds it by both its `id` and `userId: context.user.id`, so nobody can change another person's rows.

In `main.wasp.ts`, import the spec and add it to `spec: [...]`:

```ts
import { notesSpec } from "./src/notes/notes.wasp";
```

## 3. Page

Copy `NotesPage.tsx` and reshape it for your model. Keep all of its states: the saving button, the message under an invalid field, the server's error message, and the list's loading, empty and error states. Rewrite every piece of interface text for the person's app.

## 4. Navigation

Add the page to `appNavigationItems` in `src/client/components/NavBar/constants.ts`, or to the app's own navigation when the shell was rebuilt:

```ts
import { routes } from "wasp/client/router";
import type { NavigationItem } from "./NavBar";

export const appNavigationItems: NavigationItem[] = [
  { name: "Notes", to: routes.NotesRoute.to },
];
```

When this is the app's main page, also send people to it after they sign in (`AGENTS.md`, under Recipes, lists the places).

## 5. Seed data

Give the demo user a few realistic rows in `src/server/scripts/dbSeeds.ts`, so the preview shows the feature in use instead of an empty state:

```ts
const demoNotes = [
  {
    title: "Ideas for the team meeting",
    content: "Share last month's wins.\nPick one thing to improve next.",
  },
  {
    title: "Groceries for the weekend",
    content: "Bread, apples, coffee beans and something for Sunday lunch.",
  },
];
```

and inside `prismaClient.user.create({ data: { ... } })`, next to `auth`:

```ts
notes: { create: demoNotes },
```

The seed skips a demo user that already exists, so these rows reach only databases seeded after your change.

## 6. Verify

1. `grep -ri "note" src/<feature> main.wasp.ts schema.prisma src/server/scripts/dbSeeds.ts src/client/components/NavBar` finds nothing, unless the app really is about notes.
2. `npx tsc -p tsconfig.src.json --noEmit` passes.
3. In the preview, signed in: the page opens from the navigation, an empty form shows its message under the field, a valid one adds a row to the list, and a new account sees the empty state.
