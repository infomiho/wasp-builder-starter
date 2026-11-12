# Auth

This app signs people in with a **username and a password**, configured in `src/auth/auth.wasp.ts`. Nothing else is set up: no email, no password reset, no social login.

- The login and signup pages in `src/auth/` are this app's own, built around `login` and `signup` from `wasp/client/auth`. `AGENTS.md`, under Recipes, lists every place to change when people should land on another page after signing in.
- `src/auth/userSignupFields.ts` copies the username onto `User.username` at signup. Another field stored at signup goes there and on the `User` model.
- Wasp checks at signup that the password has at least 8 characters and a number. Usernames are compared without regard to case.
- `page(NotesPage, { authRequired: true })` renders the page only for a signed-in person. It guards only the page, so every query, action and API checks `context.user` for itself. A prerendered route cannot have `authRequired`.

## The signed-in person

| Where | How |
| --- | --- |
| A page with `authRequired` | the `user` prop: `export function NotesPage({ user }: { user: AuthUser })`, with `AuthUser` from `wasp/auth` |
| Any other component | `const { data: user } = useAuth()` from `wasp/client/auth`. `user` is `null` when signed out and `undefined` while loading |
| A query, action or API | `context.user`, `undefined` when signed out |
| A job | no user. The user's id travels in the job's arguments |

- `user` holds the fields of the `User` model (`id`, `username`, `createdAt` and any added to `schema.prisma`), never the password.
- To show who created a row, select through the relation: `include: { user: { select: { username: true } } }`. A whole `User` sent to the browser would carry its `auth` relation.
- `useLogOut()` from `src/auth/hooks/useLogOut.ts` leaves the page before calling `logout`.

## What is not set up

Each of these needs settings, secrets and pages this app does not have, so its docs page comes before any code:

- Email signup, email verification, password reset: https://wasp.sh/docs/features/auth/email/overview.md and https://wasp.sh/docs/features/email.md (it needs an email provider).
- Google, GitHub or another social login: https://wasp.sh/docs/features/auth/social-auth/overview.md, then the provider's page next to it (`google.md`, `github.md`).
- Extra fields at signup, hooks that run on signup or login: https://wasp.sh/docs/features/auth/overview.md and https://wasp.sh/docs/features/auth/hooks.md

An app has either username or email login, not both. Switching locks out existing accounts, which the person should hear before it happens.
