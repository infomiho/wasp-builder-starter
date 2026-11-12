# Env variables

Server variables are private. Client variables are built into the JavaScript everyone downloads, so they never hold a secret.

| | Server | Client (React) |
| --- | --- | --- |
| Name | any (`WEATHER_API_KEY`) | starts with `REACT_APP_` |
| Local file (git ignores both) | `.env.server` | `.env.client` |
| Read with | `import { env } from "wasp/server"` | `import { env } from "wasp/client"` |
| Declared in `src/env.ts` as | `serverEnvValidationSchema` | `clientEnvValidationSchema` |
| Registered in `main.wasp.ts` as | `server: { envValidationSchema: serverEnvValidationSchema }` | `client: { rootComponent: App, envValidationSchema: clientEnvValidationSchema }` |

A variable appears on `env` only after it is in a registered schema. The starter has no `src/env.ts` until a feature needs one:

```ts
// src/env.ts
import { defineEnvValidationSchema } from "wasp/env";
import * as z from "zod";

export const serverEnvValidationSchema = defineEnvValidationSchema(
  z.object({
    WEATHER_API_KEY: z.string().optional(),
  }),
);

export const clientEnvValidationSchema = defineEnvValidationSchema(
  z.object({
    REACT_APP_SUPPORT_EMAIL: z.string().optional(),
  }),
);
```

`main.wasp.ts` imports the schemas as refs: `import { clientEnvValidationSchema, serverEnvValidationSchema } from "./src/env" with { type: "ref" };`

- **Every variable is `.optional()`** or has `.default(...)`. Wasp checks the schema when the server starts, and a required variable that is missing stops the whole app with `Env vars validation failed`. The feature checks for the value where it uses it and tells the person what to set up, such as `throw new HttpError(503, "The weather isn't set up yet. Add a weather API key to turn it on.")`.
- `env` makes a typo a type error, which `process.env` and `import.meta.env` do not.
- This app has zod 4: messages are `z.string({ error: "..." })`, and the older `required_error` key is a type error.
- The platform provides `DATABASE_URL`, `WASP_SERVER_URL`, `WASP_WEB_CLIENT_URL`, `REACT_APP_API_URL`, `PORT` and `JWT_SECRET`, so they are never set by hand. `env.WASP_WEB_CLIENT_URL` and `env.WASP_SERVER_URL` give the server the app's own addresses.
