# Data: `schema.prisma` and entities

Every `model` in `schema.prisma` is a Wasp entity. The `feature-pattern` skill has the model to copy and the seed data step.

- A relation is written on both sides: `user` and `userId` on the new model, and the list (`notes Note[]`) on `User`. When the list is left out, Wasp adds one named after the model (`Note Note[]`), and `user.notes` does not exist.
- Wasp adds its own auth models (`Auth`, `AuthIdentity`, `Session`) and an `auth` relation on `User`, so the schema does not declare them. Passwords live there, not on `User`.
- Operations, APIs and jobs reach rows through `context.entities.Note`. Other server code (a seed, a helper) uses the `PrismaClient` the seed receives, or `prisma` from `wasp/server`.
- The row type is `Note` from `wasp/entities`, on the server and in React. A schema enum comes from `@prisma/client`: `import { Status } from "@prisma/client"`.
- A new seed function has the type `DbSeedFn` from `wasp/server`. It is imported in `main.wasp.ts` as a ref and added to `db: { seeds: [...] }`.

## Migrations

After the turn, the platform generates a migration from the schema's difference and applies it. Until then the running app has the old tables, so a new page can show a database error in the preview mid-turn. It clears when the turn ends.

The migration runs on tables that already hold rows, with nobody there to confirm a risky step, so a change that could lose data is refused:

| Change | Result | Instead |
| --- | --- | --- |
| New model, or a new field that is optional (`String?`) or has a default (`@default("")`) | applies | |
| New required field without a default | fails: `Added the required column ... without a default value` | give it a default, or make it optional and handle the missing value in code |
| New required relation on an existing model | fails the same way | make it optional (`owner User?` with `ownerId String?`), existing rows have nobody to point at |
| Renamed field or model, or a changed field type | fails: `Prisma Migrate has detected that the environment is non-interactive` | keep the old field and add a new one beside it. The name people see is interface text, not the column name |
| Removed field or model that holds data | fails the same way | stop using it in the code and leave it in the schema |
| New `@unique` on an existing field | fails the same way | leave it out |

After `The database migration failed`, the fix is in `schema.prisma`: bring it back to changes that apply. The error text suggests `prisma migrate dev --create-only` and editing the migration by hand, and neither is available here.
