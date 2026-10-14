---
title: Getting Started with Nuxtify CMS
description: Learn how to author rich content, organize collections, and leverage built-in Vuetify components.
summary: Learn how to author rich content, organize collections, and leverage built-in Vuetify components in Nuxtify CMS.
author: sparky
topics: ["tips"]
publishedAt: 2026-10-10T12:00:00Z
updatedAt: 2026-10-10T12:00:00Z
sitemap:
  lastmod: 2026-10-10T12:00:00Z
---

Nuxtify CMS bridges the gap between file-based content simplicity and the rich interactive styling of Vuetify. Whether you are building documentation, a technical blog, or marketing landing pages, Nuxtify provides structured content management right out of the box.

| Feature | Description |
| :--- | :--- |
| **Content Engine** | Nuxt Content v3 with Git-backed file storage |
| **UI Framework** | Vuetify 3 Material Design components out of the box |
| **Type Safety** | Zod-validated frontmatter for articles, authors, and topics |
| **Rich Interactivity** | MDC support for embedding Vue components in Markdown |

With these features combined, you can build rich, content-driven experiences without sacrificing developer velocity or design fidelity.

## Core Capabilities

Nuxtify is built around structured Nuxt Content v3 collections paired with modern Vue 3 components:

- **Type-Safe Frontmatter:** Validated through Zod schemas for articles, contributors, topics, and pages.
- **Dynamic Routing:** Pre-configured routes for `/articles`, `/topics`, and `/contributors` with zero setup.
- **Rich MDC Support:** Use Vuetify and Nuxtify layout components directly within Markdown documents.
- **Integrated SEO:** Automated OpenGraph metadata, JSON-LD Schema.org graphs, and sitemap entries.

## Organizing Content Collections

All content lives within the `content/` directory. Each subfolder maps to a specialized collection schema:

```text
content/
├── articles/        # Long-form posts with authors, topics, and dates
├── contributors/    # Contributor bios, avatars, and social links
├── notes/           # Short-form micro-updates and changelogs
├── topics/          # Categorization tags for cross-linking articles
└── *.md             # Standalone root pages (about, home, etc.)
```

### Writing Your First Article

To publish an article, create a new Markdown file inside `content/articles/` with frontmatter adhering to the `articleSchema`:

#### YAML

```yaml
---
title: My First Article
description: A quick introduction to authoring in Nuxtify CMS.
summary: A quick introduction to authoring in Nuxtify CMS.
author: sparky
topics: ["tips"]
publishedAt: 2026-10-10T12:00:00Z
---
```

> **Tip:** The `author` field references the filename slug in `content/contributors/` (e.g., `sparky` references `sparky.md`).

## Interactive Components in Markdown

Thanks to Nuxt Content's MDC syntax, you can embed rich Vue components straight into your articles:

::page-card-simple{title="Explore Component Showcase" description="Check out all pre-built page cards, banners, heroes, and FAQ accordions." buttonText="View Demo Components" to="/demo-components" class="my-6"}
::

## Working with Images

Nuxtify CMS makes it effortless to display images and media in your content. Static assets placed in the `public/` directory are served directly.

Meet [**Sparky**](/contributors/sparky), the official Nuxtify mascot who helps guide you through your content creation journey:

![Sparky the Nuxtify Mascot](/content/contributors/sparky.jpg)

You can use standard Markdown image syntax or leverage MDC components to display responsive visuals, banners, and diagrams anywhere in your posts.

## Next Steps

1. Add your profile under `content/contributors/`.
2. Define custom topics in `content/topics/`.
3. Start authoring your articles and publish them instantly!
