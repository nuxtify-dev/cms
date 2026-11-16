import {
  buildArticleSchemaNodes,
  type ArticleSchemaOptions,
} from '../utils/seo'
import { useNuxtifyConfig } from './nuxtify'
import {
  defineArticle,
  defineBreadcrumb,
  useSchemaOrg,
  useSiteConfig,
} from '#imports'

export type UseArticleSchemaOptions = ArticleSchemaOptions

/**
 * Registers Schema.org structured data for articles and notes using runtime
 * module and SiteConfig defaults.
 */
export function useArticleSchema(options: UseArticleSchemaOptions) {
  const nuxtifyConfig = useNuxtifyConfig()
  const siteConfig = useSiteConfig()

  const nodes = buildArticleSchemaNodes(
    {
      ...options,
      siteUrl: options.siteUrl ?? siteConfig.url,
      contributorsPrefix: options.contributorsPrefix ?? nuxtifyConfig.content?.contributors?.routePrefix,
      contributorsEnabled: options.contributorsEnabled ?? (nuxtifyConfig.content?.contributors?.enabled !== false),
    },
    {
      article: node => defineArticle(node as Parameters<typeof defineArticle>[0]),
      breadcrumb: node => defineBreadcrumb(node as Parameters<typeof defineBreadcrumb>[0]),
    },
  )

  if (nodes.length > 0) {
    useSchemaOrg(nodes)
  }
}
