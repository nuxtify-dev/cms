---
title: Welcome to Notes
author: sparky
publishedAt: 2026-10-10T14:00:00Z
tags:
  - Announcements
  - Nuxtify
---

Welcome to the new **Notes** feature in Nuxtify CMS! Notes are short, focused updates and thoughts.

## Overview

Notes provide a lightweight format for jotting down ideas, status updates, and quick announcements without the overhead of a [full blog post](/posts/welcome).

| Feature | Notes | Articles |
| :--- | :--- | :--- |
| **Length** | Short & concise | Long-form |
| **Format** | Quick thoughts, snippets | Deep dives, tutorials |
| **Estimated Read Time** | < 2 mins | 5–15 mins |

### What's Supported?

You can use standard Markdown as well as extended syntax:

- [x] **Task lists** for quick todos
- [x] Tables with alignment
- [x] Code snippets with syntax highlighting
- [ ] Direct publishing to social feeds (coming soon)

> "Simplicity is prerequisite for reliability."  
> — *Edsger W. Dijkstra*

### Code Example

```ts
interface Note {
  title: string
  publishedAt: string
  tags: string[]
}

const note: Note = {
  title: 'Welcome to Notes',
  publishedAt: '2026-10-10',
  tags: ['Announcements', 'Nuxtify']
}
```
