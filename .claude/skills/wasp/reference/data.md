# Data: `schema.prisma` and entities

Every `model` in `schema.prisma` is a Wasp entity. There is no other place to define one.

```prisma
model User {
  id                        String          @id @default(uuid())
  createdAt                 DateTime        @default(now())

  username                  String?         @unique
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

- Ids are `String @id @default(uuid())` and foreign keys are `String`. `AGENTS.md` has the rule and its reason.
- Write both sides of a relation: `user` and `userId` on the new model, and the list (`notes Note[]`) on `User`. When the list is left out, Wasp adds one named after the model (`Note Note[]`), and `user.notes` does not exist.
- Wasp adds its own auth models (`Auth`, `AuthIdentity`, `Session`) and an `auth` relation on `User`. Never declare them. Passwords live there, not on `User`.
- `datasource` and `generator` at the top stay as they are.

## From model to code

| You want | Use |
| --- | --- |
| The row type | `import type { Note } from "wasp/entities"`, on the server and in React |
| To read or write rows in an operation, API or job | `context.entities.Note`, after listing `"Note"` in its `entities` |
| To read or write rows elsewhere on the server (a seed, a helper) | the `PrismaClient` the seed receives, or `import { prisma } from "wasp/server"` and `prisma.note` |
| An enum from the schema, in React | `import { Status } from "@prisma/client"` |

React never talks to the database. It calls a query or an action.

## Migrations: what the platform does with your schema

You only edit `schema.prisma`. After your turn the platform generates a migration from the difference and applies it. Until then the running app still has the old tables, so a new page can show a database error in the preview while you are still working. That one clears when your turn ends.

The migration runs against tables that already hold rows, and nobody is there to confirm a risky step. A change that could lose data or fail on existing rows is refused:

| Change | Result |
| --- | --- |
| New model | applies |
| New field that is optional (`String?`) or has a default (`@default("")`, `@default(false)`, `@default(now())`) | applies |
| Removed field that holds no values | applies |
| New required field without a default | fails: `Added the required column ... without a default value. There are N rows in this table` |
| Renamed field or model (Prisma sees a removal and an addition) | fails: `Prisma Migrate has detected that the environment is non-interactive` |
| Removed field or model that holds data | fails the same way |
| Changed field type | fails the same way |
| New `@unique` on an existing field | fails the same way |

So change the schema by adding:

- Need a required value? Add the field with a default, or as optional and handle the missing value in code.
- New required relation on an existing model? Make it optional (`owner User?` with `ownerId String?`). Existing rows have nobody to point at.
- Want another name or type? Keep the old field and add a new one beside it. The name people see is interface text, not the column name.
- A field is no longer needed? Stop using it in the code and leave it in the schema.

When the platform reports `The database migration failed`, bring `schema.prisma` back to a change from the rows that apply. The error text suggests `prisma migrate dev --create-only` and editing the migration by hand. Do neither: never run that command and never write, edit or delete a file in `migrations/`.

## Seed data

`src/server/scripts/dbSeeds.ts` creates the demo user. Add sample rows for a new feature there (the `feature-pattern` skill, step 5, shows how). A new seed function is imported in `main.wasp.ts` as a ref and added to `db: { seeds: [...] }`. Its type is `DbSeedFn` from `wasp/server`: `(prisma: PrismaClient) => Promise<void>`.
