import { type App } from "@wasp.sh/spec";

import { APP_DESCRIPTION, APP_NAME } from "../shared/common";

export const head: App["head"] = [
  '<link rel="icon" href="/favicon.ico" />',
  `<meta name="description" content="${APP_DESCRIPTION}" />`,
  '<meta property="og:type" content="website" />',
  `<meta property="og:title" content="${APP_NAME}" />`,
  `<meta property="og:description" content="${APP_DESCRIPTION}" />`,
];
