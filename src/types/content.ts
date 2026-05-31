import type { PageCollectionItemBase } from '@nuxt/content'
import type { z } from 'zod'
import type {
  imageSchema,
  pageSchema,
  contributorSchema,
  articleSchema,
  topicSchema,
} from '../runtime/utils/contentSchemas'

export type Image = z.infer<typeof imageSchema>

type FixSitemap<T> = Omit<T, 'sitemap'> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sitemap?: any
}

export interface Page extends PageCollectionItemBase, Omit<FixSitemap<z.infer<typeof pageSchema>>, 'draft'> {
  draft?: boolean
}

export interface Contributor extends PageCollectionItemBase, Omit<FixSitemap<z.infer<typeof contributorSchema>>, 'draft'> {
  draft?: boolean
}
export type ContributorSocials = NonNullable<Contributor['socials']>

export interface Article extends PageCollectionItemBase, Omit<FixSitemap<z.infer<typeof articleSchema>>, 'draft'> {
  draft?: boolean
}

export interface Topic extends PageCollectionItemBase, Omit<FixSitemap<z.infer<typeof topicSchema>>, 'draft'> {
  draft?: boolean
}

declare module '@nuxt/content' {
  interface Collections {
    pages: Page
    contributors: Contributor
    articles: Article
    topics: Topic
  }
}
