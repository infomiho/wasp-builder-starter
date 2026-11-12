import { app, page, route } from "@wasp.sh/spec";

import { App } from "./src/client/App" with { type: "ref" };
import { NotFoundPage } from "./src/client/components/NotFoundPage" with { type: "ref" };
import { LandingPage } from "./src/landing-page/LandingPage" with { type: "ref" };
import { seedDemoUser } from "./src/server/scripts/dbSeeds" with { type: "ref" };

import { authConfig, authSpec } from "./src/auth/auth.wasp";
import { head } from "./src/client/head.wasp";
import { notesSpec } from "./src/notes/notes.wasp";
import { APP_NAME } from "./src/shared/common";
import { userSpec } from "./src/user/user.wasp";

export default app({
  name: "OpenSaaS",
  wasp: { version: "^0.26.1" },
  title: APP_NAME,
  head,
  auth: authConfig,
  db: {
    // Run `wasp db seed` to seed the database with the seed functions below:
    seeds: [
      // Creates the demo user shown on the login page, with a few notes.
      seedDemoUser,
    ],
  },
  client: {
    rootComponent: App,
  },
  spec: [
    // Prerendering routes with static content creates HTML files at build time that are served immediately,
    // improving SEO, search engine/AI crawling, and performance: https://wasp.sh/docs/advanced/prerendering
    route("LandingPageRoute", "/", page(LandingPage), { prerender: true }),
    route("NotFoundRoute", "*", page(NotFoundPage)),
    authSpec,
    userSpec,
    notesSpec,
  ],
});
