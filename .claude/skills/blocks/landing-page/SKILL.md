---
name: landing-page
description: Adds Open SaaS's full marketing sections to the landing page. Use when the person wants a richer home page: a feature grid, a highlighted feature, testimonials, an FAQ, an examples carousel or navigation links to page sections.
---

# Landing page block

**For the person:** your home page gets the sections a product site usually has, such as a feature grid, customer quotes and common questions.

**Secrets and accounts:** none.

The code comes from Open SaaS at tag `wasp-v0.26-template`. Fetch each file with:

```sh
curl -fsSL "https://raw.githubusercontent.com/wasp-lang/open-saas/wasp-v0.26-template/template/app/<path>" -o "<path>"
```

## 1. Choose the sections

Ask which sections the person wants, or pick the ones that fit what they described. Add only sections you can fill with content about their app. Open SaaS's placeholder content (its example screenshots, the "Da Boi" mascot quotes, "Cool Feature 1") never ships: write real copy from what you know about the app, in plain words and sentence case.

| Section | Files to fetch | Content it needs |
| --- | --- | --- |
| Feature grid | `src/landing-page/components/FeaturesGrid.tsx` | 4 to 9 features: name, one-line description, an emoji or a `lucide-react` icon |
| Highlighted feature | `src/landing-page/components/HighlightedFeature.tsx` | One feature with a title, a paragraph and a visual (an image, or a component built from the UI kit) |
| Testimonials | `src/landing-page/components/Testimonials.tsx`, `src/client/static/avatar-placeholder.webp` | Real quotes from real people, with a name and role, that the person gives you. Never invent quotes or names: without real ones, leave this section out. Use the placeholder avatar unless the person gives photos |
| FAQ | `src/landing-page/components/FAQ.tsx` | 3 to 6 questions with answers |
| Examples carousel | `src/landing-page/components/ExamplesCarousel.tsx` | Screenshots the person provides, put in `src/client/static/examples/` |

Keep the starter's own `Hero.tsx`, `Features.tsx`, `SectionTitle.tsx` and `Footer.tsx`. Leave out these Open SaaS files:

- `SchemaMarkup.tsx`: React refuses to run a `<script>` it renders, and logs a console error on every visit.
- `Footer.tsx`: it uses hardcoded gray colors and a missing `boxdark` token, so it breaks dark mode. Add link columns to the starter's footer instead, colored with `text-muted-foreground` and `hover:text-foreground`.
- `Clients.tsx` and `landing-page/logos/`: logos of companies that are not the person's clients.
- `ExampleHighlightedFeature.tsx` and the `open-saas-banner-*` images: Open SaaS's own marketing.

## 2. Bring in the files

Fetch the chosen files to the same paths. Then adapt them to the starter:

- **FeaturesGrid.tsx** imports `Feature` from `./Features`, whose shape differs here. Replace the import line and `export interface GridFeature extends Omit<Feature, "icon"> {` with a standalone interface that starts with its own fields:

  ```ts
  export interface GridFeature {
    name: string;
    description: string;
    href?: string;
  ```

  Keep the rest of the interface as it is. Cards with an `href` open it in a new tab, so leave `href` out unless a feature links somewhere real.

- **Section spacing.** The Open SaaS sections set their own large outer margins (`mt-32 sm:mt-56`, `my-16 md:my-24 lg:my-40`, `lg:py-32`), which stack into big empty gaps. Replace each section's outer margin and padding with the spacing the starter's `Features.tsx` uses, `pb-24 sm:pb-32`, and keep its width, `px-*` and `scroll-mt-24` classes.
- **Section headings.** `Testimonials.tsx` titles itself "What Our Users Say", `FeaturesGrid.tsx` says "These are some of the features of the product." and `FAQ.tsx` says "Frequently asked questions". Rewrite those in sentence case for this app.

- **Content.** Put the section data next to `features` in `src/landing-page/contentSections.ts`, typed with the interfaces the components export or declare (`GridFeature`, and matching object shapes for testimonials, FAQs and examples). Import images at the top of that file, like `import avatarPlaceholder from "../client/static/avatar-placeholder.webp";`.

## 3. Wire it into the page

In `src/landing-page/LandingPage.tsx`, render the sections inside the `isolate` wrapper after `<Hero />`, in this order where present: `ExamplesCarousel`, `HighlightedFeature`, `Features` or `FeaturesGrid`, `Testimonials`, `FAQ`. The grid replaces the starter's `Features` section when both describe the same things. Remove whatever becomes unused.

No `main.wasp.ts`, `schema.prisma`, env var, dependency or migration change: the UI kit already has the accordion and cards these sections use.

## 4. Navigation

To link visitors to sections, give each section an `id` and list it in `src/client/components/NavBar/constants.ts`:

```ts
export const marketingNavigationItems: NavigationItem[] = [
  { name: "Features", to: "/#features" },
  { name: "FAQ", to: "/#faq" },
];
```

In `src/client/components/NavBar/NavBar.tsx`, show them to signed-out visitors by changing `const visibleNavigationItems = user ? navigationItems : [];` to `user ? navigationItems : marketingNavigationItems` (and import it). `App.tsx` already scrolls to the `#id` in the address.

## 5. Verify

1. `npx tsc -p tsconfig.src.json --noEmit` passes.
2. In the preview, open `/` signed out at desktop and phone widths, in light and dark mode. Every section has real content, no image is missing, nothing overlaps, and text stays readable in dark mode.
3. The navigation links scroll to their sections, and the browser console shows no errors.
