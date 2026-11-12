---
name: admin-dashboard
description: Adds the Open SaaS admin area: a sidebar layout at /admin, a searchable users table with an admin switch, and (with analytics) an overview of signups and traffic. Use when the person wants an admin, back office or staff area to see and manage users.
---

# Admin dashboard block

**For the person:** admins get a private area where they can see everyone who signed up and choose who else is an admin.

**Secrets and accounts:** none. `ADMIN_USERNAMES` (optional, comma-separated usernames) makes those people admins when they sign up. Without it, only the seeded demo user is an admin. Tell the person how to make themselves an admin: add their username to `ADMIN_USERNAMES` in the platform's environment settings before signing up, or ask an existing admin to flip the switch.

The code comes from Open SaaS at tag `wasp-v0.26-template`. Fetch each file with:

```sh
curl -fsSL "https://raw.githubusercontent.com/wasp-lang/open-saas/wasp-v0.26-template/template/app/<path>" -o "<path>"
```

## 1. Bring in the files

Fetch into the same paths:

- `src/admin/admin.wasp.ts`
- `src/admin/layout/`: `DefaultLayout.tsx`, `Header.tsx`, `Sidebar.tsx`, `SidebarLinkGroup.tsx`, `Breadcrumb.tsx`, `LoadingSpinner.tsx`
- `src/admin/dashboards/users/`: `UsersDashboardPage.tsx`, `UsersTable.tsx`, `DropdownEditDelete.tsx`
- `src/client/hooks/useDebounce.ts`
- `src/user/operations.ts` (`getPaginatedUsers` and `updateIsUserAdminById`)
- With the `analytics` block's in-app stats only: `src/admin/dashboards/analytics/` (all seven files)

Leave out Open SaaS's demo pages (`elements/calendar`, `elements/settings`, `elements/ui-elements`, `dashboards/messages`): they are placeholders.

## 2. Adapt to the starter

- **`admin.wasp.ts`:** keep only the routes whose pages you fetched. Without analytics, point `AdminRoute` (`/admin`) at `UsersDashboardPage` and remove `AdminUsersRoute`.
- **`Sidebar.tsx`:** keep only the menu items for those routes, and remove the icons and imports that leaves unused.
- **`Header.tsx`:** remove `MessageButton` and its import.
- **`src/user/operations.ts`:** this starter has no `email` (unless the `payments` block added it) and no subscriptions (unless `payments` is installed). Filter by `username` (`usernameContains`) instead of `emailContains`, drop `subscriptionStatusIn`, its zod field and the `SubscriptionStatus` import, and select only fields that exist. Then make `UsersTable.tsx` match: a "Username" search box, no subscription filter or column. Keep the `isAdmin` checks in both operations.
- **`src/user/user.wasp.ts`:** add `query(getPaginatedUsers, { entities: ["User"] })` and `action(updateIsUserAdminById, { entities: ["User"] })`, importing both from `./operations` with `{ type: "ref" }`.
- **Theme:** the admin pages use theme extras this starter dropped. Copy from `src/client/Main.css` at the tag into the `@theme inline` block: the `--breakpoint-2xsm` and `--breakpoint-xsm` lines, `--text-title-md` with its line height, the `--min-width-*`, `--z-index-*`, `--shadow-default` and `--shadow-card` lines, and the `@utility no-scrollbar` block. Copy only what the fetched files use.

## 3. Who is an admin

- `schema.prisma`: add `isAdmin Boolean @default(false)` to `User`.
- `src/auth/userSignupFields.ts`: add `isAdmin` to `getUsernameUserFields`, true when the username is in `ADMIN_USERNAMES`:

  ```ts
  isAdmin: (data) => {
    const usernameData = usernameDataSchema.parse(data);
    return env.ADMIN_USERNAMES.includes(usernameData.username);
  },
  ```

- `src/auth/env.ts` (new) with the schema, registered through `src/env.ts` and `main.wasp.ts` like the other blocks (`server: { envValidationSchema: serverEnvValidationSchema }`):

  ```ts
  import * as z from "zod";

  export const authEnvSchema = z.object({
    ADMIN_USERNAMES: z
      .string()
      .default("")
      .transform((usernames) =>
        usernames
          .split(",")
          .map((username) => username.trim())
          .filter(Boolean),
      ),
  });
  ```

- `src/server/scripts/dbSeeds.ts`: create the demo user with `isAdmin: true`, so the preview has an admin.

The platform generates and applies the migration.

## 4. Layout and navigation

- `src/client/App.tsx`: the admin area has its own sidebar layout. Hide the `NavBar` when `location.pathname.startsWith(routes.AdminRoute.to)`, like `App.tsx` at the tag, and keep the skip link and the `<main>` around `<Outlet />`.
- `main.wasp.ts`: `import { adminSpec } from "./src/admin/admin.wasp";` and add `adminSpec` to `spec: [...]`.
- `src/user/constants.ts`: add `{ name: "Admin", to: routes.AdminRoute.to, icon: Shield, isAdminOnly: true }`, give the other items `isAdminOnly: false`, and in `UserDropdown.tsx` and `UserMenuItems.tsx` skip items with `isAdminOnly` when `!user.isAdmin` (`UserMenuItems` then needs the `user` prop again).
- No new dependency for the users table. The analytics overview needs `"apexcharts": "5.10.1"` and `"react-apexcharts": "2.1.0"`, plus the `.apexcharts-*` rules from the end of `Main.css` at the tag.

## 5. Verify

1. `npx tsc -p tsconfig.src.json --noEmit` passes.
2. Signed in as the demo user, the user menu shows "Admin", `/admin` shows the users table, searching by username filters it, and the admin switch saves.
3. Signed in as a new non-admin user, there is no "Admin" link, and opening `/admin` sends them to the home page.
4. Check the admin pages in light and dark mode at desktop and phone widths (the sidebar collapses), with no browser console errors.
