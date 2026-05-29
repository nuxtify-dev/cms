import type { z } from 'zod'
import type {
  imageSchema,
  pageSchema,
  contributorSchema,
  articleSchema,
  topicSchema,
} from '../runtime/utils/contentSchemas'

export interface NuxtContent {
  path: string
  title: string
  description?: string
}

export type Image = z.infer<typeof imageSchema>

type FixSitemap<T> = Omit<T, 'sitemap'> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sitemap?: any
}

export type Page = Omit<FixSitemap<z.infer<typeof pageSchema>>, 'draft'> & { draft?: boolean } & NuxtContent

export type Contributor = Omit<FixSitemap<z.infer<typeof contributorSchema>>, 'draft'> & { draft?: boolean } & NuxtContent
export type ContributorSocials = NonNullable<Contributor['socials']>

export type Article = Omit<FixSitemap<z.infer<typeof articleSchema>>, 'draft'> & { draft?: boolean } & NuxtContent

export type Topic = Omit<FixSitemap<z.infer<typeof topicSchema>>, 'draft'> & { draft?: boolean } & NuxtContent
