import { defineRobotsSchema } from '@nuxtjs/robots/content'
import { defineSitemapSchema } from '@nuxtjs/sitemap/content'
// import { defineOgImageSchema } from 'nuxt-og-image/content'
import { defineSchemaOrgSchema } from 'nuxt-schema-org/content'
import { z } from 'zod'

export const seoSchema = z.object({
  robots: defineRobotsSchema(),
  sitemap: defineSitemapSchema(),
  // ogImage: defineOgImageSchema(), TODO: enable ogImage
  schemaOrg: defineSchemaOrgSchema(),
})

export const imageSchema = z.object({
  src: z.string(),
  alt: z.string(),
})

export const pageSchema = z.object({
  publishedAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  overline: z.string().optional(),
  align: z.enum(['left', 'center', 'right']).optional(),
  showTitle: z.boolean().default(true),
  image: imageSchema.optional(),
  draft: z.boolean().default(false),
}).merge(seoSchema)

export const contributorSchema = z.object({
  name: z.string(),
  jobTitle: z.string().optional(),
  honorificSuffix: z.string().optional(),
  image: imageSchema.optional(),
  draft: z.boolean().default(false),
  socials: z.object({
    bluesky: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    github: z.string().optional(),
    linkedin: z.string().optional(),
    pinterest: z.string().optional(),
    tiktok: z.string().optional(),
    x: z.string().optional(),
    youtube: z.string().optional(),
    website: z.string().optional(),
  }).optional(),
}).merge(seoSchema)

export const articleSchema = z.object({
  summary: z.string().max(250).optional(),
  publishedAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  author: z.string(), // slug of contributor
  image: imageSchema.optional(),
  draft: z.boolean().default(false),
  topics: z.array(z.string()).default([]).optional(),
}).merge(seoSchema)

export const topicSchema = z.object({
  image: imageSchema.optional(),
  draft: z.boolean().default(false),
}).merge(seoSchema)
