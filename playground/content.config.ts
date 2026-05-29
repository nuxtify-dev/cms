import { defineContentConfig, defineCollection } from '@nuxt/content'
import {
  pageSchema,
  contributorSchema,
  articleSchema,
  topicSchema,
} from '../src/runtime/utils/contentSchemas'

export default defineContentConfig({
  collections: {
    // Pages
    pages: defineCollection({
      type: 'page',
      source: '*.md',
      schema: pageSchema,
    }),

    // Contributors
    contributors: defineCollection({
      type: 'page',
      source: 'contributors/*.md',
      schema: contributorSchema,
    }),

    // Articles
    articles: defineCollection({
      type: 'page',
      source: 'articles/*.md',
      schema: articleSchema,
    }),

    // Topics
    topics: defineCollection({
      type: 'page',
      source: 'topics/*.md',
      schema: topicSchema,
    }),
  },
})
