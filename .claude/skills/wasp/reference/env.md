# Env variables

Two separate sets. Server variables are private. Client variables are built into the JavaScript everyone downloads, so they never hold a secret.

| | Server | Client (React) |
| --- | --- | --- |
| Name | any (`WEATHER_API_KEY`) | must start with `REACT_APP_` |
| Local file (git ignores both) | `.env.server` | `.env.client` |
| Read with | `import { env } from "wasp/server"` | `import { env } from "wasp/client"` |
| Declared in `src/env.ts` as | `serverEnvValidationSchema` | `clientEnvValidationSchema` |

## Declare, register, read

A variable appears on `env` only after it is in the schema. This starter has no `src/env.ts` until a feature needs one. Create it, or add to the one that is there:

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

Register each schema once in `main.wasp.ts`, imported as a ref:

```ts
import { clientEnvValidationSchema, serverEnvValidationSchema } from "./src/env" with { type: "ref" };

export default app({
  // ...
  server: { envValidationSchema: serverEnvValidationSchema },
  client: {
    rootComponent: App,
    envValidationSchema: clientEnvValidationSchema,
  },
  // ...
});
```

Read it:

```ts
import { env, HttpError } from "wasp/server";

if (!env.WEATHER_API_KEY) {
  throw new HttpError(503, "The weather isn't set up yet. Add a weather API key to turn it on.");
}
```

- **Every variable is `.optional()`** (or has `.default(...)`). Wasp checks the schema when the server starts. A required variable that is missing stops the whole app with `Env vars validation failed`, and the preview goes down. The feature checks for the value where it uses it and tells the person what to set up.
- This app has zod 4. Write messages as `z.string({ error: "..." })`. The `required_error` key in older examples is a type error.
- Use `env`, not `process.env` or `import.meta.env`, so a typo is a type error.
- Never set `DATABASE_URL`, `WASP_SERVER_URL`, `WASP_WEB_CLIENT_URL`, `REACT_APP_API_URL`, `PORT` or `JWT_SECRET`. The platform provides them. `env.WASP_WEB_CLIENT_URL` and `env.WASP_SERVER_URL` are there to read on the server when you need the app's own address.
- A secret never goes in a `REACT_APP_` variable, in code or in a committed file. Tell the person which variables to add in the platform's environment settings.
