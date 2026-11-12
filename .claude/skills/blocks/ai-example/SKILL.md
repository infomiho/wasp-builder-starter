---
name: ai-example
description: Adds Open SaaS's AI day planner, an OpenAI-powered example feature. Use when the person wants AI in the app (generate, summarise, plan or suggest with a language model) and needs a working starting point.
---

# AI example block

**For the person:** a page where you list your tasks and AI plans your day, which shows how to build any AI feature into your app.

**Secrets and accounts:** an OpenAI API key (`OPENAI_API_KEY`) from platform.openai.com, which needs an OpenAI account with billing. Without it the page still works for adding tasks, and asking for a plan shows: "The AI planner isn't set up yet. Add an OpenAI API key to turn it on." Tell the person that in plain words, and how to add the key in the platform's environment settings. Never ask them to paste the key into chat or a file.

The code comes from Open SaaS at tag `wasp-v0.26-template`. Fetch each file with:

```sh
curl -fsSL "https://raw.githubusercontent.com/wasp-lang/open-saas/wasp-v0.26-template/template/app/<path>" -o "<path>"
```

## 1. Bring in the files

Create `src/demo-ai-app/` and fetch into it, keeping the same paths:

- `src/demo-ai-app/demo-ai-app.wasp.ts`
- `src/demo-ai-app/DemoAppPage.tsx`
- `src/demo-ai-app/operations.ts`
- `src/demo-ai-app/schedule.ts`
- `src/demo-ai-app/env.ts`

## 2. Make the key optional

In Open SaaS the server refuses to start without the key. Here it must start.

1. In `src/demo-ai-app/env.ts`, make the key optional: `OPENAI_API_KEY: z.string().optional(),`.
2. Create `src/env.ts`:

   ```ts
   import { defineEnvValidationSchema } from "wasp/env";
   import * as z from "zod";
   import { demoAiAppEnvSchema } from "./demo-ai-app/env";

   // Wasp validates `process.env` with this schema at server startup.
   // Read the values with `import { env } from "wasp/server"`.
   export const serverEnvValidationSchema = defineEnvValidationSchema(
     z.object({
       ...demoAiAppEnvSchema.shape,
     }),
   );
   ```

   If `src/env.ts` already exists, add the `...demoAiAppEnvSchema.shape` line to it instead.
3. In `main.wasp.ts`, import it with the other refs, `import { serverEnvValidationSchema } from "./src/env" with { type: "ref" };`, and add `server: { envValidationSchema: serverEnvValidationSchema },` to the `app({...})` config (skip if it is already there).

## 3. Adapt the operations

In `src/demo-ai-app/operations.ts`:

1. **Create the client only when the key exists.** Replace `const openAi = new OpenAI({ apiKey: env.OPENAI_API_KEY });` with:

   ```ts
   const AI_NOT_SET_UP_MESSAGE =
     "The AI planner isn't set up yet. Add an OpenAI API key to turn it on.";

   function getOpenAiClient(): OpenAI {
     if (!env.OPENAI_API_KEY) {
       throw new HttpError(503, AI_NOT_SET_UP_MESSAGE);
     }
     return new OpenAI({ apiKey: env.OPENAI_API_KEY });
   }
   ```

   and in `generateScheduleWithGpt` call `getOpenAiClient().chat.completions.create(...)` instead of `openAi.chat.completions.create(...)`.

2. **Credits belong to payments.** Without the `payments` block, remove `import { SubscriptionStatus } from "../payment/plans";`, the `isUserSubscribed` function, the credit reservation (`shouldChargeCredit` and its `updateMany`), and the `try { ... } catch` that refunds the credit, keeping the body of the `try`. With the `payments` block, keep them as they are.

3. Remove `console.log("Calling open AI api");`.

## 4. Adapt the page

In `src/demo-ai-app/DemoAppPage.tsx`:

- Without the `payments` block, remove the `if (statusCode === 402) { ... } else { ... }` branch so every error shows the destructive toast with the server's message, and remove the imports that leaves unused (`Link`, `routes`, `ArrowRight`, `ToastAction`).
- In `handleSubmit`, replace `window.alert("Error: " + message);` with the same destructive toast: `toast({ title: "Couldn't add the task", description: message, variant: "destructive" });`.
- The "How many hours will you work today?" row overflows phone screens. Remove `text-nowrap` from its `Label` and give the `Input` `className="w-24 shrink-0 text-center"` instead of `min-w-28`.
- Rewrite the heading and intro for the person (for example "Plan your day" and "Add your tasks, then let AI turn them into a plan.") and put user-facing labels in sentence case ("Add task", "Generate plan").

## 5. Schema

Add to `schema.prisma`, and the back relations to `User`:

```prisma
model GptResponse {
  id                        String          @id @default(uuid())
  createdAt                 DateTime        @default(now())
  updatedAt                 DateTime        @updatedAt

  user                      User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId                    String

  content                   String
}

model Task {
  id                        String          @id @default(uuid())
  createdAt                 DateTime        @default(now())

  user                      User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId                    String

  description               String
  time                      String          @default("1")
  isDone                    Boolean         @default(false)
}
```

```prisma
model User {
  // ...existing fields
  gptResponses              GptResponse[]
  tasks                     Task[]
}
```

The platform generates and applies the migration.

## 6. Spec, dependency and navigation

- `main.wasp.ts`: `import { demoAiAppSpec } from "./src/demo-ai-app/demo-ai-app.wasp";` and add `demoAiAppSpec` to `spec: [...]`. It declares the `/demo-app` route (`DemoAppRoute`), the task operations and `generateGptResponse`.
- `package.json` dependencies: `"openai": "^6.27.0"`.
- `src/client/components/NavBar/constants.ts`: add `{ name: "AI planner", to: routes.DemoAppRoute.to }`.
- `generateScheduleWithGpt` sets `model: "gpt-3.5-turbo"` at the tag. Change it to `model: "gpt-6-luna"` unless the person asks for another, and drop the comment after it.

## 7. Verify

1. `npx tsc -p tsconfig.src.json --noEmit` passes.
2. In the preview, signed in, open the new navigation link. Add a task: it appears in the list, and you can tick and delete it.
3. Without `OPENAI_API_KEY`, the server starts, and "Generate plan" shows the not-set-up message instead of failing. With the key, it shows a plan.
4. Check light and dark mode at desktop and phone widths, and that the browser console shows no errors.
