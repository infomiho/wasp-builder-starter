---
name: analytics
description: Adds Open SaaS visitor analytics: a Plausible (or Google Analytics) tracking script, and an hourly job that saves daily stats for the admin dashboard. Use when the person wants to count visitors, page views or traffic sources.
---

# Analytics block

**For the person:** you can see how many people visit your app and where they come from, in your Plausible (or Google Analytics) dashboard and, with the admin dashboard, inside the app.

**Secrets and accounts:**

- Plausible (recommended, no cookies): a Plausible site for the app's domain. Tracking needs only the domain, which is not a secret. The in-app stats job also needs `PLAUSIBLE_API_KEY`, `PLAUSIBLE_SITE_ID` and `PLAUSIBLE_BASE_URL` (`https://plausible.io/api`, or a self-hosted instance).
- Google Analytics: a GA4 property. Tracking needs `REACT_APP_GOOGLE_ANALYTICS_ID` (`G-...`) and a cookie consent banner, because Google sets cookies. The stats job needs `GOOGLE_ANALYTICS_CLIENT_EMAIL`, `GOOGLE_ANALYTICS_PRIVATE_KEY` (base64) and `GOOGLE_ANALYTICS_PROPERTY_ID`.

Until a key is set, the app runs normally, the job logs that analytics is not set up and skips its run, and the admin dashboard shows empty stats. Tell the person in plain words which values to add in the platform's environment settings. Never ask them to paste a key into chat or a file.

The code comes from Open SaaS at tag `wasp-v0.26-template`. Fetch each file with:

```sh
curl -fsSL "https://raw.githubusercontent.com/wasp-lang/open-saas/wasp-v0.26-template/template/app/<path>" -o "<path>"
```

## 1. Tracking (always)

**Plausible.** Add the script to `src/client/head.wasp.ts`, with the person's domain:

```ts
'<script async data-domain="example.com" src="https://plausible.io/js/script.js"></script>',
```

Wasp renders `head` entries as JSX, so keep `async` (not `defer`) and close the tag. Ask the person for the domain. Plausible ignores `localhost`, so the preview records nothing.

**Google Analytics.** Fetch `src/client/components/cookie-consent/Banner.tsx` and `Config.ts`, add `"vanilla-cookieconsent": "^3.0.1"` to `package.json` dependencies, render `<CookieConsentBanner />` in `src/client/App.tsx` after the `<Toaster />`, and read `REACT_APP_GOOGLE_ANALYTICS_ID` through a client env schema (`clientEnvValidationSchema` in `src/env.ts`, registered as `client: { envValidationSchema }` in `main.wasp.ts`, with the variable optional). Restyle the banner's colors with the theme tokens if it looks off in dark mode, and rewrite its text in plain words.

Stop here when the person only wants tracking.

## 2. In-app stats (with the admin dashboard)

The stats job feeds the admin dashboard's overview page. Add it together with the `admin-dashboard` block, or after it.

1. Fetch into `src/analytics/`: `analytics.wasp.ts`, `operations.ts`, `stats.ts`, `env.ts`, and `providers/plausibleAnalyticsUtils.ts` (or `providers/googleAnalyticsUtils.ts`, then switch the import in `stats.ts`).
2. **Make the keys optional.** In `src/analytics/env.ts`, make every variable `z.string().optional()`. Add the schema you use to `src/env.ts` (create it like this if missing) and register it in `main.wasp.ts` with `server: { envValidationSchema: serverEnvValidationSchema }`, imported as `import { serverEnvValidationSchema } from "./src/env" with { type: "ref" };`:

   ```ts
   import { defineEnvValidationSchema } from "wasp/env";
   import * as z from "zod";
   import { plausibleEnvSchema } from "./analytics/env";

   // Wasp validates `process.env` with this schema at server startup.
   // Read the values with `import { env } from "wasp/server"`.
   export const serverEnvValidationSchema = defineEnvValidationSchema(
     z.object({
       ...plausibleEnvSchema.shape,
     }),
   );
   ```

3. **Skip the run without keys.** At the top of `calculateDailyStatsJob` in `stats.ts`, return early when the provider's variables are missing, with one `console.log("Analytics isn't set up yet, skipping the daily stats.")`. `googleAnalyticsUtils.ts` builds its client when it loads, so move that construction into a function called inside the job.
4. **Revenue belongs to payments.** Without the `payments` block, remove the `paymentProcessor` and `SubscriptionStatus` imports from `stats.ts`, set `paidUserCount` and `totalRevenue` to `0`, and drop the paid-user query.
5. **Schema.** Add these models from `schema.prisma` at the tag, unchanged: `DailyStats`, `PageViewSource` and `Logs`.
6. **Spec.** `main.wasp.ts`: `import { analyticsSpec } from "./src/analytics/analytics.wasp";` and add `analyticsSpec` to `spec: [...]`. It declares `getDailyStats` (admins only, so it needs `isAdmin` from the admin dashboard block) and the hourly `calculateDailyStatsJob` on PgBoss.
7. **Dependency.** Only for Google Analytics stats: `"@google-analytics/data": "4.1.0"`.

The platform generates and applies the migration.

## 3. Verify

1. `npx tsc -p tsconfig.src.json --noEmit` passes.
2. The page source of `/` contains the tracking script, and the browser console shows no errors.
3. With stats: the server starts without analytics keys and logs the skip message once an hour, and the admin dashboard's overview loads without errors.
