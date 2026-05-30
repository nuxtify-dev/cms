---
title: Page Components Demo
description: A comprehensive interactive showcase of all the pre-built page components in @nuxtify/cms.
overline: CMS Component Playground
publishedAt: 2026-05-30T12:00:00Z
align: center
showTitle: true
---

Welcome to the **@nuxtify/cms** components showcase! This page is generated dynamically from a single markdown file (`playground/content/demo-components.md`) using Nuxt Content and Vuetify. It showcases all the pre-built page layouts, banners, grid systems, cards, and dynamic components available in the module.

---

## 1. Breadcrumbs (`PageBreadcrumbs`)
The `<PageBreadcrumbs>` component renders a clean, accessible breadcrumb trail utilizing Vuetify's `v-breadcrumbs`.

::page-breadcrumbs{ :breadcrumbs='[ { "title": "Home", "to": "/" }, { "title": "CMS Components", "to": "/demo-components", "disabled": true } ]' }
::

---

## 2. Page Banner (`PageBanner`)
The `<PageBanner>` component creates a full-width background section to highlight important announcements, events, or alerts.

::page-banner{text="✨ Live Announcement: Nuxtify CMS is a powerful extension of Nuxt and Vuetify!"}
::

---

## 3. Page Hero (`PageHero`)
The `<PageHero>` component is a high-impact, customizable hero section designed for landing pages and headers. It supports multiple action buttons, alignments, and caption notes.

::page-hero{overline="Feature Highlight" title="Build Stunning Content-Driven Web Apps" description="The ultimate developer-focused toolkit that integrates Nuxt Content, Vuetify, and SEO-best practices out-of-the-box." caption="Completely free and open source." :links='[ { "text": "Get Started", "to": "/", "color": "primary" }, { "text": "Documentation", "href": "https://nuxtify.dev", "color": "secondary", "variant": "outlined", "target": "_blank" } ]' align="center"}
::

---

## 4. Page Section (`PageSection`)
The `<PageSection>` component structures and sections your content, complete with optional overlines, titles, sub-descriptions, and standard layout padding.

::page-section{overline="Organized Layouts" title="Section Heading Example" description="Use sections to split up complex pages with beautiful responsive vertical spacing." align="left"}
Below this section, you'll find custom grids and cards.
::

---

## 5. Grid System & Cards (`PageGrid`, `PageCardSimple`, & `PageCard`)
Use the `<PageGrid>` layout component with `<PageCardSimple>` and `<PageCard>` to build responsive multi-column layouts effortlessly.

### 5.1 Simple Cards (`PageCardSimple`)
`<PageCardSimple>` provides a clean, hover-enabled card ideal for listing highlights or features.

::page-grid
  ::page-card-simple{to="/about" title="About Us" description="Read about our core values, mission statement, and team history." buttonText="Read About Us" class="mb-4"}
  ::
  ::page-card-simple{to="/config" title="Configuration Options" description="Learn how to configure themes, SEO parameters, and API keys." buttonText="View Config" class="mb-4"}
  ::
  ::page-card-simple{to="/pages-features" title="Page Layout Features" description="Explore responsive navigation, drawers, and customizable banners." buttonText="Explore Layouts" class="mb-4"}
  ::
::

### 5.2 Advanced Cards (`PageCard`)
`<PageCard>` supports full HTML/MDC slots for customized header, footer, prepend/append icons, and body text.

::page-grid
  ::page-card{title="Security First" description="Ensuring your content remains safe with standard encryption." :link='{ "to": "/", "prependIcon": "mdi-shield-lock-outline", "appendIcon": "mdi-chevron-right" }' variant="elevated" color="primary"}
  ::
  ::page-card{title="High Performance" description="Blazing fast load times with static generation support." :link='{ "to": "/", "prependIcon": "mdi-flash-outline", "appendIcon": "mdi-chevron-right" }' variant="tonal" color="secondary"}
  ::
  ::page-card{title="SEO Optimized" description="Automatic schema markup, sitemap generation, and meta tags." :link='{ "to": "/", "prependIcon": "mdi-trending-up", "appendIcon": "mdi-chevron-right" }' variant="outlined" color="success"}
  ::
::

---

## 6. Call To Action (`PageCta`)
The `<PageCta>` component provides an interactive container with an optional background color or variant, prompting users to take action.

::page-cta{title="Ready to Unleash Your Site's Potential?" description="Join thousands of developers building fast, accessible web experiences with Nuxt and Vuetify." caption="No credit card required. Installs in seconds." :links='[ { "text": "Get Started for Free", "to": "/", "color": "primary", "size": "large" } ]' align="center" variant="tonal" color="primary"}
::

---

## 7. Split List (`PageSplitList`)
The `<PageSplitList>` displays key informational points split cleanly with titles on the left and comprehensive descriptions on the right.

::page-split-list{ :items='[ { "title": "Developer Friendly", "description": "Write markdown with MDC component support, customize theme colors, and let `@nuxtify/cms` handle the boilerplate." }, { "title": "SEO & Analytics Integrated", "description": "Fully supports OpenGraph images, Schema.org structure, and sitemaps so search engines index your pages correctly." }, { "title": "Fully Accessible", "description": "Crafted with clean, semantic markup, optimized keyboard navigation, and aria-roles built-in." } ]' }
::

---

## 8. FAQ Accordion (`PageFaq`)
The `<PageFaq>` component compiles common questions into an interactive, beautifully bordered, search-engine-friendly accordion utilizing Vuetify's `v-expansion-panels`.

::page-faq{ :questions='[ { "question": "Can I use multiple markdown files under the same folder?", "answer": "Yes! The Pages collection is configured to capture all root-level `*.md` files. You can create as many as you like." }, { "question": "Are Vuetify components supported inside Markdown files?", "answer": "Absolutely! Thanks to Nuxt Content MDC syntax, you can use any Vuetify component or any registered Nuxtify component directly." } ]' variant="inset" }
::

---

## 9. Automatic Elements: Container, Title, Body & Content Styles
At the layout level, `[...slug].vue` uses the following wrapper components to keep the page layout consistent:
- `<PageContainer>`: Centers the content on large monitors with a standardized max-width.
- `<PageTitle>`: Automatically renders at the top of the page (using frontmatter properties `title`, `description`, `overline`, and `align`).
- `<PageBody>`: Places all body content within a standard multi-column responsive grid layout.
- `<PageContentStyles>`: Adds consistent typographic, heading, and spacing rules specifically tailored for Markdown output (like spacing between lists, headings, and blockquotes).
