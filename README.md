# My app

The starter app for Wasp Builder: [Open SaaS](https://github.com/wasp-lang/open-saas) stripped to its core, on [Wasp](https://wasp.sh) 0.26. It has a landing page, username and password auth and an account page. It needs no secrets.

## Run it

Requires Wasp 0.26.1 and Docker.

```sh
wasp install
wasp start db          # in its own terminal, keep it running
wasp db migrate-dev
wasp db seed           # creates the demo user
wasp start             # http://localhost:3000
```

Demo login: username `demo`, password `demo12345`. The seed is for development databases only: never run it against production.

## Building blocks

Features removed from Open SaaS come back as agent skills in `.claude/skills/blocks/`:

- `payments`: pricing page, checkout and subscriptions with Stripe, Lemon Squeezy, Polar or Paddle
- `file-upload`: file uploads to AWS S3
- `admin-dashboard`: admin area with a users table
- `analytics`: Plausible or Google Analytics tracking and daily stats
- `landing-page`: full marketing sections
- `ai-example`: an AI day planner on OpenAI

`.claude/skills/feature-pattern/` holds an example feature (notes) that shows the full Wasp pattern for agents to copy. It is not part of the app.

`AGENTS.md` explains the project to coding agents.
