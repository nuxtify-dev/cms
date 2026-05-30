# Nuxtify CMS Workspace Context

This document provides developer instructions, architectural details, workspace patterns, and run/test guidelines for the **Nuxtify CMS** module codebase.

---

## Project Overview

**Nuxtify CMS** (`@nuxtify/cms`) is a lightweight, file-based CMS module built on top of [Nuxt](https://nuxt.com/) and [Nuxt Content](https://content.nuxt.com/). It provides structured pages, articles, topics, and contributors out of the box with sensible default components, styling, and composables, which can be easily overridden or customized by the host application.

### Key Stack & Technologies
- **Framework:** Nuxt 4 (Vue 3, Vue Composition API, Single File Components)
- **Content Engine:** `@nuxt/content` (v3) for parsing, querying, and schemas
- **Styling & Components:** Built with components designed to override cleanly via [Vuetify (v3)](https://vuetifyjs.com/) or custom layouts, and `@nuxtify/pages` dependency
- **SEO & Metadata:** `@nuxtjs/seo` (including sitemap, robots, schema.org)
- **Database:** `better-sqlite3` (for Nuxt Content database indexing)
- **Testing:** `vitest`, `@nuxt/test-utils` (happy-dom and e2e testing)
- **TypeScript:** Fully typed with Zod schema validation for frontmatter content

---

## Codebase Architecture & Structure

```text
nuxtify-cms\
├── src/                          # Core module source code
│   ├── module.ts                 # Main module definition (entry point)
│   ├── types.ts                  # Module option types
│   ├── runtime/                  # Assets compiled & loaded in consuming apps
│   │   ├── components/           # Auto-registered Nuxt components (e.g. PageHero, ArticleCard, AuthorByline)
│   │   ├── composables/          # Auto-registered composables (e.g. usePublicCollection)
│   │   ├── pages/                # Prepended pages/routes (articles, topics, contributors, slugs)
│   │   └── utils/                # Schema definitions (Zod/Content) & SEO helpers
│   └── types/                    # Core typescript declarations (content, link, etc.)
├── playground/                   # Local sandbox Nuxt application for manual testing and dev
│   ├── content.config.ts         # Nuxt Content v3 collections mapping to runtime schemas
│   ├── nuxt.config.ts            # Local configuration importing the module locally
│   ├── app.config.ts             # App config override settings
│   └── content/                  # Markdown files (.md) for testing/previewing CMS features
├── test/                         # Automated tests
│   ├── basic.test.ts             # E2E integration test using Nuxt fixture
│   └── nuxt/
│       └── component.test.ts     # Component/unit tests running under Nuxt environment
└── vitest.config.ts              # Vitest configuration defining workspaces and coverage
```

### Route & Page Extension
The module automatically registers dynamic pages using `extendPages` in `src/module.ts` by pre-pending (via `unshift`) the runtime pages:
- `/:slug` &rarr; `runtime/pages/[...slug].vue`
- `/articles` &rarr; `runtime/pages/articles/index.vue`
- `/articles/:slug` &rarr; `runtime/pages/articles/[slug].vue`
- `/topics` &rarr; `runtime/pages/topics/index.vue`
- `/topics/:slug` &rarr; `runtime/pages/topics/[slug].vue`
- `/contributors` &rarr; `runtime/pages/contributors/index.vue`
- `/contributors/:slug` &rarr; `runtime/pages/contributors/[slug].vue`

---

## Building, Running, & Testing

The key commands specified in `package.json` are:

| Command | Action / Description |
| :--- | :--- |
| **`npm run dev:prepare`** | Cleans `dist`, stubs the module, generates Nuxt typescript configurations, and prepares playground typings. **Run this first or after schema changes.** |
| **`npm run dev`** | Runs `dev:prepare` and launches the Nuxt development server in the `playground/` directory. |
| **`npm run test`** | Runs all Vitest tests (unit and integration) with coverage collection. |
| **`npm run test:nuxt`** | Runs only the Nuxt-specific environment vitest project (`test/nuxt/*.test.ts`). |
| **`npm run test:types`** | Runs TypeScript compiler checks on both the core module and the playground. |
| **`npm run lint`** | Lints the workspace using ESLint (v9 flat config). |
| **`npm run lint:fix`** | Standard ESLint auto-fix for the whole codebase. |
| **`npm run prepack`** | Builds the final production-ready package distribution under `/dist`. |

---

## Core Composables & Schemas

### 1. `usePublicCollection<T>(collection)`
Located in `src/runtime/composables/usePublicCollection.ts`, this wraps `@nuxt/content`'s `queryCollection(collection)` and filters out draft content when running in production (`import.meta.env.PROD`), guaranteeing draft articles are not exposed to public users.

### 2. Content Schemas
Schemas are built with Zod in `src/runtime/utils/contentSchemas.ts` merging standard SEO settings (`defineRobotsSchema`, `defineSitemapSchema`, `defineSchemaOrgSchema`):
- `pageSchema`
- `contributorSchema`
- `articleSchema`
- `topicSchema`

---

## Development Notes & Troubleshooting

### TypeScript Typings Gotcha (`test:types`)
When running `npm run test:types` (`vue-tsc --noEmit`), you may see multiple TS errors regarding missing or unresolvable collections (e.g., `'pages'`, `'articles'`, `'contributors'`, `'topics'` is not assignable to type `'content'`). 

**Why this happens:**
- The root `tsconfig.json` extends `./.nuxt/tsconfig.json` which only includes the local module-builder's context.
- The root `tsconfig.json` explicitly excludes the `playground/` directory to keep the built module separate.
- Since the actual Nuxt Content collections are defined inside the `playground/content.config.ts`, the root TS configuration is unaware of these custom collections, resulting in type errors during direct root checking.
- When consumed by an actual application, those collections are properly registered under that app's `content.config.ts`, and typescript resolutions behave correctly.
