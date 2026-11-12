# Auth

This app signs people in with a **username and a password**. Nothing else is set up: no email, no email verification, no password reset, no Google or GitHub login.

## What is configured

`src/auth/auth.wasp.ts` holds the settings, and `main.wasp.ts` uses them as `auth: authConfig`:

```ts
export const authConfig: Auth = {
  userEntity: "User",
  methods: {
    usernameAndPassword: {
      userSignupFields: getUsernameUserFields,
    },
  },
  onAuthFailedRedirectTo: "/login",
  onAuthSucceededRedirectTo: "/",
};
```

- `onAuthFailedRedirectTo`: where a signed-out visitor to an `authRequired` page is sent.
- The login and signup pages (`src/auth/LoginPage.tsx`, `SignupPage.tsx`) are this app's own, built from the UI kit around `login` and `signup` from `wasp/client/auth`. After a successful login they navigate themselves. `AGENTS.md`, under Recipes, lists every place to change when people should land on another page after signing in.
- `userSignupFields` (`src/auth/userSignupFields.ts`) copies the username onto `User.username` at signup. To store another field at signup, add it there and to the `User` model.
- Wasp checks at signup that the username is not empty and the password has at least 8 characters and a number. Usernames are compared without regard to case.

## Protect a page

```ts
route("NotesRoute", "/notes", page(NotesPage, { authRequired: true })),
```

The page renders only for a signed-in person and receives them as a prop:

```tsx
import type { AuthUser } from "wasp/auth";

export function NotePage({ user }: { user: AuthUser }) {
  return <p>Signed in as {user.username}</p>;
}
```

A prerendered route (`prerender: true`) cannot have `authRequired`.

## Protect an operation

`authRequired` guards only the page. Every query, action and API checks for itself:

```ts
if (!context.user) {
  throw new HttpError(401);
}
```

Then it limits every database call to `userId: context.user.id`.

## The signed-in person

| Where | How |
| --- | --- |
| A page with `authRequired` | the `user` prop |
| Any other component | `const { data: user } = useAuth()` from `wasp/client/auth`. `user` is `null` when signed out and `undefined` while loading |
| A query, action or API | `context.user`, `undefined` when signed out |
| A job | no user. Pass the user's id in the job's arguments |

`user` holds the fields of the `User` model: `id`, `username`, `createdAt` and any you add to `schema.prisma`. Show the person's name with `user.username`. It also has `identities.username?.id`, the login name. It never holds the password.

To show who created a row, select it through the relation: `include: { user: { select: { username: true } } }`. Never return a whole `User` with its `auth` relation to the browser.

Log out with `useLogOut()` from `src/auth/hooks/useLogOut.ts`, which leaves the page before calling `logout`.

## What is not set up

Do not guess these. Each needs settings, secrets and pages this app does not have. Fetch the page first:

| The person asks for | Fetch |
| --- | --- |
| Sign up with email, email verification, password reset | https://wasp.sh/docs/features/auth/email/overview.md and https://wasp.sh/docs/features/email.md (it needs an email provider) |
| Google, GitHub or another social login | https://wasp.sh/docs/features/auth/social-auth/overview.md, then the provider's page next to it (`google.md`, `github.md`) |
| Extra fields at signup, hooks that run on signup or login | https://wasp.sh/docs/features/auth/overview.md and https://wasp.sh/docs/features/auth/hooks.md |
| How `User`, `Auth` and `AuthIdentity` relate | https://wasp.sh/docs/features/auth/entities.md |

Username and password cannot be turned on together with email login: an app has one of the two. Switching means existing accounts can no longer sign in, so say that to the person before doing it. Every secret a login method needs follows the "Secrets never block the app" rule in `AGENTS.md`.
