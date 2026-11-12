---
name: payments
description: Adds Open SaaS payments with Stripe (or Lemon Squeezy, Polar, Paddle): a pricing page, checkout, subscriptions, one-time credit packs and a customer portal. Use when the person wants to charge money, sell plans or credits, or add a paywall.
---

# Payments block

**For the person:** people can buy a subscription or a credit pack on a pricing page, pay through Stripe and manage their plan from their account.

**Secrets and accounts:** a Stripe account (test mode is free) and these env vars:

| Variable | Where it comes from |
| --- | --- |
| `STRIPE_API_KEY` | Stripe dashboard, Developers, API keys (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | The webhook endpoint for `<server URL>/payments-webhook` in the Stripe dashboard (`whsec_...`) |
| `PAYMENTS_HOBBY_SUBSCRIPTION_PLAN_ID`, `PAYMENTS_PRO_SUBSCRIPTION_PLAN_ID`, `PAYMENTS_CREDITS_10_PLAN_ID` | The price IDs (`price_...`) of three products created in Stripe |

Until they are set, the pricing page shows the plans, and choosing one shows: "Payments aren't set up yet. Add your Stripe keys to start taking payments." Tell the person that in plain words, list the variables, and say they go in the platform's environment settings. Never ask them to paste a key into chat or a file.

Use Stripe unless the person names another processor. For Lemon Squeezy, Polar or Paddle, use the same steps with that processor's folder under `src/payment/` and its `env.ts` variables, and point `paymentProcessor.ts` and `paymentProcessorClient.ts` at it.

The code comes from Open SaaS at tag `wasp-v0.26-template`. Fetch each file with:

```sh
curl -fsSL "https://raw.githubusercontent.com/wasp-lang/open-saas/wasp-v0.26-template/template/app/<path>" -o "<path>"
```

## 1. Bring in the files

Fetch into the same paths:

- `src/payment/`: `payment.wasp.ts`, `PricingPage.tsx`, `CheckoutResultPage.tsx`, `operations.ts`, `webhook.ts`, `env.ts`, `errors.ts`, `paths.ts`, `plans.ts`, `paymentProcessor.ts`, `paymentProcessorClient.ts`, `paymentProcessorPlans.ts`, `processedWebhookEvent.ts`, `redirectToCheckout.ts`, `user.ts`
- `src/payment/stripe/`: `checkoutUtils.ts`, `env.ts`, `paymentProcessor.ts`, `paymentProcessorClient.ts`, `stripeApi.ts`, `webhook.ts`

`paymentProcessor.ts` and `paymentProcessorClient.ts` import every processor. Delete the imports and commented lines for the processors you did not fetch.

Add `assertUnreachable` back to `src/shared/utils.ts`; the Stripe code uses it:

```ts
/**
 * Used purely to help compiler check for exhaustiveness in switch statements,
 * will never execute. See https://stackoverflow.com/a/39419171.
 */
export function assertUnreachable(_: never): never {
  throw Error("This code should be unreachable");
}
```

## 2. Make the keys optional

In Open SaaS the server refuses to start without the keys. Here it must start.

1. In `src/payment/env.ts` and `src/payment/stripe/env.ts`, make every variable optional: `z.string().optional()`.
2. Create `src/env.ts` (or extend it if it exists) and register it in `main.wasp.ts` with `server: { envValidationSchema: serverEnvValidationSchema }`, importing it as `import { serverEnvValidationSchema } from "./src/env" with { type: "ref" };`:

   ```ts
   import { defineEnvValidationSchema } from "wasp/env";
   import * as z from "zod";
   import { stripeEnvSchema } from "./payment/stripe/env";

   // Wasp validates `process.env` with this schema at server startup.
   // Read the values with `import { env } from "wasp/server"`.
   export const serverEnvValidationSchema = defineEnvValidationSchema(
     z.object({
       ...stripeEnvSchema.shape,
     }),
   );
   ```

3. Add a guard to `src/payment/errors.ts` and use it wherever a key is read:

   ```ts
   import { HttpError } from "wasp/server";

   export const PAYMENTS_NOT_SET_UP_MESSAGE =
     "Payments aren't set up yet. Add your Stripe keys to start taking payments.";

   export function requirePaymentsSetting(value: string | undefined): string {
     if (!value) {
       throw new HttpError(503, PAYMENTS_NOT_SET_UP_MESSAGE);
     }
     return value;
   }
   ```

   - `stripe/stripeApi.ts`: replace the exported `stripeApi` constant with a `getStripeApi()` function that returns `new Stripe(requirePaymentsSetting(env.STRIPE_API_KEY), { apiVersion: STRIPE_API_VERSION })`, and call `getStripeApi()` where `stripeApi` was used.
   - `paymentProcessorPlans.ts`: wrap each plan ID in `requirePaymentsSetting(...)` inside `getPaymentProcessorPlanId` and `getPaymentPlanIdByPaymentProcessorPlanId`, and type the map as `Record<PaymentPlanId, string | undefined>`.
   - `stripe/webhook.ts`: read the secret with `requirePaymentsSetting(env.STRIPE_WEBHOOK_SECRET)`.

## 3. Customers need an email

Checkout identifies customers by email, and this starter signs people up with a username.

- `schema.prisma`: add `email String? @unique` to `User`.
- `src/auth/userSignupFields.ts`: add an `email` field that reads `data.email` (with zod, like the username) to `getUsernameUserFields`.
- `src/auth/CredentialsForm.tsx`: on the signup form only, add a required `type="email"` input named `email`, and pass it to `signup(...)` in `src/auth/SignupPage.tsx`.
- `src/user/AccountPage.tsx`: show the email as an account detail.

People who signed up before this change have no email: `generateCheckoutSession` already answers them with "User needs an email to make a payment." Rewrite that message for the person ("Add an email to your account before buying a plan.") and, if they ask, add an email field to the account page with an `updateEmail` action.

## 4. Remove the cancellation email

`stripe/webhook.ts` sends an email when someone cancels, through Wasp's email sender, which this starter does not configure. Remove the `if (subscription.cancel_at_period_end && user.email) { ... }` block and the `emailSender` import. Add it back only when the person sets up an email provider.

## 5. Schema

Add to `User` in `schema.prisma`:

```prisma
  paymentProcessorUserId    String?         @unique
  subscriptionStatus        String?         // 'active', 'cancel_at_period_end', 'past_due', 'deleted'
  subscriptionPlan          String?         // 'hobby', 'pro'
  datePaid                  DateTime?
  credits                   Int             @default(3)
```

Add `lemonSqueezyCustomerPortalUrl String?` only for Lemon Squeezy. Add the model:

```prisma
model ProcessedWebhookEvent {
  id                        String          @id @default(uuid())
  createdAt                 DateTime        @default(now())

  paymentProcessorEventId   String          @unique // The payment processor's event id, e.g. `evt_...` for Stripe.
  eventType                 String                  // The payment processor's event type, e.g. `invoice.paid`.
}
```

The platform generates and applies the migration.

## 6. Spec, dependency, account page and navigation

- `main.wasp.ts`: `import { paymentSpec } from "./src/payment/payment.wasp";` and add `paymentSpec` to `spec: [...]`. It declares `/pricing` (`PricingPageRoute`, prerendered), `/checkout` (`CheckoutResultRoute`), the checkout and portal operations and the `POST /payments-webhook` API.
- `package.json` dependencies: `"stripe": "18.1.0"`.
- `src/user/AccountPage.tsx`: add "Plan" and "Credits" rows using the `UserCurrentSubscriptionPlan`, `CustomerPortalButton` and `BuyMoreButton` pieces of `src/user/AccountPage.tsx` at the tag, rendered as `AccountDetail` rows in this starter's style. Label them in sentence case.
- `src/client/components/NavBar/NavBar.tsx` and `constants.ts`: show `{ name: "Pricing", to: routes.PricingPageRoute.to }` to everyone, signed in or not.
- Rewrite the plan cards in `PricingPage.tsx` (`paymentPlanCards`) with the person's plan names, prices and features, and keep `prettyPaymentPlanName` in `plans.ts` in sync.

## 7. Verify

1. `npx tsc -p tsconfig.src.json --noEmit` passes.
2. Without the Stripe variables, the server starts, `/pricing` shows the plans, and choosing one while signed in shows the not-set-up message.
3. With test keys, choosing a plan opens Stripe Checkout, the test card `4242 4242 4242 4242` completes it, and the account page shows the plan after the webhook arrives.
4. Check `/pricing`, `/checkout` and `/account` in light and dark mode at desktop and phone widths, with no browser console errors.
