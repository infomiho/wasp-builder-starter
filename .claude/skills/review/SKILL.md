---
name: review
description: Pre-submit review of your own change in this Wasp app. Use before you finish any code change, to find and fix problems, then summarise.
---

# Review

Review the change you are about to hand over, fix every finding, then summarise. The change is everything that differs from the last commit: run `git status` and `git diff` (include untracked files) to see it.

## 1. Check

Read every changed line against each rule below. A rule passes only when you have looked for its problem in the whole diff, not just where you expect it.

**Scope**
- Every changed line serves the request. Revert reformatting, renames and refactors the request did not need.
- Nothing in `AGENTS.md`, `CLAUDE.md`, `.claude/`, `.github/`, `migrations/` or `package-lock.json` changed.

**Dead code**
- No unused imports, variables, props, functions, files, routes, operations, models or dependencies, including ones the change left behind elsewhere.
- No commented-out code, debug `console.log`, or placeholder text such as "Lorem ipsum" or "TODO".

**Naming**
- Names say what a thing is or does in the app's language (`createBooking`, `isSaving`, `BookingCard`), and follow the existing pattern: `<Name>Page`, `<Name>Route`, `get<Things>` and `create<Thing>` operations, a `<feature>.wasp.ts` spec per folder.

**Duplication and overengineering**
- Logic that already exists is reused: UI kit components from `src/client/components/ui`, `cn` from `src/client/utils`, `ensureArgsSchemaOrThrowHttpError`, `formatDate` and `formatDateTime` from `src/shared/format.ts`.
- No abstraction, option, config or layer that only one caller needs. Complex inline expressions are named variables or small helpers.

**Boundaries and errors**
- Every query and action checks `context.user` (401 when missing), validates its input with a zod schema through `ensureArgsSchemaOrThrowHttpError`, and touches only the signed-in user's rows.
- Calls to outside services handle failure and a missing secret: the person sees a plain message and the rest of the app keeps working.
- Pages show loading, empty and error states for every query, and forms show the server's error message.

**Data**
- Every `schema.prisma` change is one the platform's generated migration can apply to a database with rows: new fields on existing models are optional or have a default, and relations have both sides.
- Every new model's id is `String @id @default(uuid())`, every foreign key is a `String`, and every id an operation receives is validated with `z.uuid()`.
- Each new entity is listed in the `entities` of every operation that uses it.

**UI**
- Built from the UI kit and theme tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `border-border`), with no hardcoded colors, so dark mode works.
- Interface text is plain and in sentence case, and new pages are reachable from the navigation or the user menu.

**Comments**
- Comments explain why, in one line, and only where the code cannot say it. Delete comments that restate the code, narrate the change ("Added X", "Now we..."), or praise it.

**Consistency with AGENTS.md**
- The change follows the ground rules and recipes in `AGENTS.md`. When it adds a building block, the block's own verification steps pass.

## 2. Verify

Run `npx tsc -p tsconfig.src.json --noEmit`. It must finish with no errors.

## 3. Fix and summarise

Fix each finding, then repeat steps 1 and 2 on the new diff until both are clean. Finish with a short summary for the person: what changed, in plain words, and anything they need to do (such as adding a secret).
