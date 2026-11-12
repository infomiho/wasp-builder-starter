# The full Wasp documentation

This app is on Wasp **0.26**. Every page below is plain Markdown at a fixed address. Fetch the exact URL for the thing you need, read it, then write the code. The index of all 0.26 pages is https://wasp.sh/llms-0.26.txt

| When you need | Fetch this exact URL |
| --- | --- |
| The spec files: ref imports, `ref(...)`, splitting specs | https://wasp.sh/docs/features/spec.md |
| Every option of `app`, `page`, `route`, `query`, `action`, `api`, `job`, `crud` | https://wasp.sh/docs/api/@wasp.sh/spec.md (an index: fetch the page it links for the one you need, adding `.md`) |
| Queries: implementing, `useQuery`, errors | https://wasp.sh/docs/features/data/operations/queries.md |
| Actions: cache refreshing, optimistic updates with `useAction` | https://wasp.sh/docs/features/data/operations/actions.md |
| Entities and using Prisma directly | https://wasp.sh/docs/features/data/entities.md |
| What `schema.prisma` may contain (enums, views, extensions) | https://wasp.sh/docs/features/data/prisma-file.md |
| Seeding and database settings | https://wasp.sh/docs/features/data/databases.md |
| Auth: the `user` object, signup fields, protecting pages | https://wasp.sh/docs/features/auth/overview.md |
| Username and password auth | https://wasp.sh/docs/features/auth/username-and-pass/overview.md |
| Email auth (not set up here) | https://wasp.sh/docs/features/auth/email/overview.md |
| Social login (not set up here) | https://wasp.sh/docs/features/auth/social-auth/overview.md |
| Auth hooks (run code on signup or login) | https://wasp.sh/docs/features/auth/hooks.md |
| Sending email (not set up here) | https://wasp.sh/docs/features/email.md |
| Routes, `Link`, `routes`, params, the not-found page | https://wasp.sh/docs/features/pages-and-routes.md |
| Env variables and their validation | https://wasp.sh/docs/advanced/env-vars.md |
| API routes, streaming, CORS | https://wasp.sh/docs/features/apis.md |
| Server middleware (raw bodies for webhooks) | https://wasp.sh/docs/advanced/server-customization/middleware.md |
| Jobs | https://wasp.sh/docs/features/jobs.md |
| Generated CRUD | https://wasp.sh/docs/features/data/crud.md |
| WebSockets (live updates) | https://wasp.sh/docs/features/websockets.md |
| Root component, client setup | https://wasp.sh/docs/advanced/client-customization/client-config.md |
| Images and the `public` folder | https://wasp.sh/docs/advanced/client-customization/static-assets.md |
| Prerendering and SEO | https://wasp.sh/docs/advanced/prerendering.md |

Reading the docs for this app:

- They are for a generic Wasp app. Where they differ from this repository's code or from `AGENTS.md`, this repository wins: specs per feature, named exports, UUID ids, zod 4, checks through `ensureArgsSchemaOrThrowHttpError`.
- They tell you to run `wasp start`, `wasp db migrate-dev` and other commands. The platform runs those. Skip every such step.
- Their examples use `Int @id @default(autoincrement())`. Here ids are `String @id @default(uuid())`.
- A page under `https://wasp.sh/docs/guides/legacy/` or any example with a `main.wasp` file describes the old language. Do not copy it.

The exact types Wasp generated for this app are on disk and beat any page: `.wasp/spec/dist/src/spec/publicApi/waspSpec.d.ts` for the spec, and `.wasp/out/sdk/wasp/dist/` for everything imported from `wasp/...` (read only).
