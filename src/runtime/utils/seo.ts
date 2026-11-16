import { toValue, type MaybeRefOrGetter } from 'vue'
import type { Article, Contributor, Doc, Note } from '../../types/content'
import type { BreadcrumbItem } from '../../types/link'
import type { ArticleSchemaType } from '../types/module'
import { normalizePrefix } from './routes'

interface ResolvedBreadcrumbItem {
  name: string
  item?: string
}

const resolveBreadcrumbUrl = (to: BreadcrumbItem['to']): string | undefined => {
  if (typeof to === 'string') {
    const trimmed = to.trim()
    return trimmed || undefined
  }
  if (to && typeof to === 'object' && 'path' in to && typeof to.path === 'string') {
    const trimmed = to.path.trim()
    return trimmed || undefined
  }
  return undefined
}

/**
 * Normalizes UI breadcrumb items (with an optional final current-page item) into
 * Schema.org `ListItem` entries. Drops non-final items without a URL and returns
 * an empty array when fewer than two valid items remain.
 */
export const getBreadcrumbsSchema = (
  breadcrumbs: BreadcrumbItem[],
  currentItem?: Pick<BreadcrumbItem, 'title' | 'to'>,
): ResolvedBreadcrumbItem[] => {
  const combined = currentItem?.title ? [...breadcrumbs, currentItem] : breadcrumbs
  const candidates = combined
    .filter(item => Boolean(item.title?.trim()))
    .map(item => ({
      name: item.title.trim(),
      url: resolveBreadcrumbUrl(item.to),
    }))

  const valid = candidates.filter((entry, index) => {
    const isLast = index === candidates.length - 1
    return isLast || Boolean(entry.url)
  })

  if (valid.length < 2) return []

  return valid.map(entry => ({
    name: entry.name,
    ...(entry.url ? { item: entry.url } : {}),
  }))
}

/**
 * Strips common Markdown formatting for plain-text Schema.org fields.
 */
export const stripMarkdown = (text?: string): string => {
  if (!text) return ''

  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1')
    .replace(/`{1,3}([^`]*)`{1,3}/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/(^|\s)\*([^*]+)\*(?=[\s.,!?;:]|$)/g, '$1$2')
    .replace(/(^|\s)_([^_]+)_(?=[\s.,!?;:]|$)/g, '$1$2')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Ensures image paths passed to Schema.org resolvers are either absolute URLs
 * or root-relative paths so `@unhead/schema-org` prepends the site origin cleanly.
 */
export const normalizeSchemaImage = (src?: string): string | undefined => {
  const trimmed = src?.trim()
  if (!trimmed) return undefined
  if (/^(?:https?:)?\/\//i.test(trimmed) || trimmed.startsWith('/')) {
    return trimmed
  }
  return `/${trimmed.replace(/^\.\//, '')}`
}

/**
 * Maps `nuxtify.brand` options into a low-priority `site-config-stack` entry
 * so sites configured only with `brand` still populate SiteConfig and Schema.org
 * Organization identity without overriding explicit `site` or `schemaOrg.identity`.
 */
export const buildBrandSiteConfigFallback = (brand?: {
  name?: string
  domain?: string
  tagline?: string
  logo?: {
    lightUrl?: string
    darkUrl?: string
  }
}): Record<string, unknown> | undefined => {
  const name = brand?.name?.trim() || undefined
  const description = brand?.tagline?.trim() || undefined
  const domain = brand?.domain?.trim()
  const url = domain
    ? (/^https?:\/\//i.test(domain) ? domain : `https://${domain}`)
    : undefined
  const logo = normalizeSchemaImage(brand?.logo?.lightUrl || brand?.logo?.darkUrl)

  if (!name && !description && !url && !logo) {
    return undefined
  }

  return {
    _priority: -10,
    ...(name ? { name } : {}),
    ...(description ? { description } : {}),
    ...(url ? { url } : {}),
    identity: {
      type: 'Organization',
      ...(logo ? { logo } : {}),
    },
  }
}

const isBreadcrumbNode = (node: unknown): boolean => {
  if (!node || typeof node !== 'object' || !('@type' in node)) return false
  const nodeType = (node as { '@type'?: unknown })['@type']
  if (nodeType === 'BreadcrumbList') return true
  return Array.isArray(nodeType) && nodeType.includes('BreadcrumbList')
}

/**
 * Normalizes a frontmatter `schemaOrg` override (object or array) or fallback
 * default nodes, appending a breadcrumb node when valid breadcrumbs exist and
 * no explicit `BreadcrumbList` is already present.
 */
export const mergeSchemaOrgNodes = (
  override: unknown,
  defaultNodes: Record<string, unknown>[],
  breadcrumbNode?: Record<string, unknown>,
): Record<string, unknown>[] => {
  const baseNodes: Record<string, unknown>[] = override
    ? (Array.isArray(override) ? [...override] : [override]) as Record<string, unknown>[]
    : [...defaultNodes]

  if (breadcrumbNode && !baseNodes.some(isBreadcrumbNode)) {
    baseNodes.push(breadcrumbNode)
  }

  return baseNodes
}

const extractText = (node: unknown): string => {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)

  if (Array.isArray(node)) {
    if (
      typeof node[0] === 'string'
      && node.length >= 2
      && typeof node[1] === 'object'
      && !Array.isArray(node[1])
    ) {
      return node.slice(2).map(extractText).join(' ')
    }
    return node.map(extractText).join(' ')
  }

  if (typeof node === 'object') {
    const record = node as Record<string, unknown>
    if (typeof record.value === 'string') {
      return record.value
    }
    if (Array.isArray(record.value)) {
      return record.value.map(extractText).join(' ')
    }
    if (Array.isArray(record.children)) {
      return record.children.map(extractText).join(' ')
    }
  }
  return ''
}

/**
 * Counts words inside a Nuxt Content AST body node for reading-time and Schema.org `wordCount`.
 */
export const countDocumentWords = (body: unknown): number => {
  if (!body) return 0
  const matches = extractText(body).trim().match(/\S+/g)
  return matches ? matches.length : 0
}

export interface ContentPageSchemaDoc {
  title?: string
  description?: string
  path?: string
  publishedAt?: string | Date
  updatedAt?: string | Date
  image?: {
    src?: string
  }
  seo?: {
    title?: string
    description?: string
  }
  schemaOrg?: unknown
}

export interface ContentPageSchemaOptions {
  /** Override the Schema.org WebPage `@type` (e.g. `'CollectionPage'`, `'AboutPage'`) */
  type?: MaybeRefOrGetter<string | undefined>
  /** Parent UI breadcrumb items; the current page is appended automatically */
  breadcrumbs?: MaybeRefOrGetter<BreadcrumbItem[] | undefined>
  /** Explicit headline / page name fallback */
  headline?: MaybeRefOrGetter<string | undefined>
  /** Optional concise title for the final breadcrumb item (defaults to `doc.title` or `headline`) */
  breadcrumbTitle?: MaybeRefOrGetter<string | undefined>
  /** Explicit description fallback */
  description?: MaybeRefOrGetter<string | undefined>
  /** Explicit image path or URL fallback */
  image?: MaybeRefOrGetter<string | undefined>
  /** Explicit current page path fallback for breadcrumb termination */
  path?: MaybeRefOrGetter<string | undefined>
}

export interface ContentPageSchemaResolvers {
  webPage?: (node: Record<string, unknown>) => Record<string, unknown>
  breadcrumb?: (node: Record<string, unknown>) => Record<string, unknown>
}

/**
 * Builds Schema.org nodes (`WebPage` + optional `BreadcrumbList`) for content
 * pages and taxonomy pages, honoring frontmatter `schemaOrg` overrides.
 */
export const buildContentPageSchemaNodes = (
  docRef: MaybeRefOrGetter<ContentPageSchemaDoc | null | undefined>,
  options: ContentPageSchemaOptions = {},
  resolvers: ContentPageSchemaResolvers = {},
): Record<string, unknown>[] => {
  const doc = toValue(docRef)
  if (!doc) return []

  const wrapWebPage = resolvers.webPage ?? (node => ({ '@type': 'WebPage', ...node }))
  const wrapBreadcrumb = resolvers.breadcrumb ?? (node => ({ '@type': 'BreadcrumbList', ...node }))

  const pageType = toValue(options.type)
  const headline = toValue(options.headline) ?? doc.seo?.title ?? doc.title ?? undefined
  const breadcrumbLabel = toValue(options.breadcrumbTitle) ?? doc.title ?? headline
  const rawDescription = toValue(options.description) ?? doc.seo?.description ?? doc.description ?? undefined
  const description = stripMarkdown(rawDescription) || undefined
  const image = normalizeSchemaImage(toValue(options.image) ?? doc.image?.src)
  const currentPath = toValue(options.path) ?? doc.path
  const breadcrumbs = toValue(options.breadcrumbs) || []

  const breadcrumbItems = breadcrumbLabel
    ? getBreadcrumbsSchema(breadcrumbs, { title: breadcrumbLabel, to: currentPath })
    : []
  const breadcrumbNode = breadcrumbItems.length >= 2
    ? wrapBreadcrumb({ itemListElement: breadcrumbItems })
    : undefined

  const webPageNode = wrapWebPage({
    ...(pageType ? { '@type': pageType } : {}),
    ...(headline ? { name: headline } : {}),
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
    ...(doc.publishedAt ? { datePublished: doc.publishedAt } : {}),
    ...(doc.updatedAt ? { dateModified: doc.updatedAt } : {}),
  })

  return mergeSchemaOrgNodes(
    doc.schemaOrg,
    [webPageNode],
    breadcrumbNode,
  )
}

export interface ArticleSchemaOptions {
  /** Article or note document */
  doc: MaybeRefOrGetter<Article | Note | null | undefined>
  /** Resolved contributor record (when available) */
  author?: MaybeRefOrGetter<Contributor | null | undefined>
  /** Contributor slug override (defaults to `doc.author`) */
  authorSlug?: MaybeRefOrGetter<string | undefined>
  /** Module-level default `@type` when frontmatter `schemaType` is not set */
  schemaType?: MaybeRefOrGetter<ArticleSchemaType | undefined>
  /** Parent UI breadcrumb items; the current article/note is appended automatically */
  breadcrumbs?: MaybeRefOrGetter<BreadcrumbItem[] | undefined>
  /** Normalized topic/tag keywords */
  keywords?: MaybeRefOrGetter<string[] | undefined>
  /** Primary topic/section name */
  section?: MaybeRefOrGetter<string | undefined>
  /** Explicit word count override (computed from `doc.body` when omitted) */
  wordCount?: MaybeRefOrGetter<number | undefined>
  /** Site URL override (defaults to `useSiteConfig().url`) */
  siteUrl?: MaybeRefOrGetter<string | undefined>
  /** Contributors route prefix override */
  contributorsPrefix?: MaybeRefOrGetter<string | undefined>
  /** Whether contributor profile routes are enabled */
  contributorsEnabled?: MaybeRefOrGetter<boolean | undefined>
}

export interface ArticleSchemaResolvers {
  article?: (node: Record<string, unknown>) => Record<string, unknown>
  breadcrumb?: (node: Record<string, unknown>) => Record<string, unknown>
}

const buildAuthorUrl = (
  siteUrl: string | undefined,
  contributorsPrefix: string,
  authorSlug: string | undefined,
  contributorsEnabled: boolean,
): string | undefined => {
  if (!contributorsEnabled || !authorSlug) return undefined
  const baseUrl = siteUrl ? siteUrl.replace(/\/$/, '') : ''
  return `${baseUrl}${contributorsPrefix}/${authorSlug}`
}

interface SharedArticleSchemaInput {
  schemaType: ArticleSchemaType
  headline?: string
  rawDescription?: string
  imageSrc?: string
  publishedAt?: string | Date
  updatedAt?: string | Date
  authors?: Record<string, unknown>[]
  section?: string
  keywords?: string[]
  explicitWordCount?: number
  body: unknown
  breadcrumbs: BreadcrumbItem[]
  breadcrumbTitle?: string
  currentPath?: string
  schemaOrg: unknown
}

const assembleArticleSchemaNodes = (
  input: SharedArticleSchemaInput,
  resolvers: ArticleSchemaResolvers,
): Record<string, unknown>[] => {
  const wrapArticle = resolvers.article ?? (node => node)
  const wrapBreadcrumb = resolvers.breadcrumb ?? (node => ({ '@type': 'BreadcrumbList', ...node }))

  const description = stripMarkdown(input.rawDescription) || undefined
  const image = normalizeSchemaImage(input.imageSrc)
  const section = input.section?.trim() || undefined
  const keywords = (input.keywords || []).map(k => k.trim()).filter(Boolean)
  const computedWordCount = input.explicitWordCount ?? countDocumentWords(input.body)
  const wordCount = typeof computedWordCount === 'number' && computedWordCount > 0
    ? computedWordCount
    : undefined

  const breadcrumbItems = input.breadcrumbTitle
    ? getBreadcrumbsSchema(input.breadcrumbs, { title: input.breadcrumbTitle, to: input.currentPath })
    : []
  const breadcrumbNode = breadcrumbItems.length >= 2
    ? wrapBreadcrumb({ itemListElement: breadcrumbItems })
    : undefined

  const articleNode = wrapArticle({
    '@type': input.schemaType,
    ...(input.publishedAt ? { datePublished: input.publishedAt } : {}),
    ...(input.updatedAt ? { dateModified: input.updatedAt } : {}),
    ...(input.headline ? { headline: input.headline } : {}),
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
    ...(input.authors?.length ? { author: input.authors } : {}),
    ...(section ? { articleSection: section } : {}),
    ...(keywords.length > 0 ? { keywords } : {}),
    ...(wordCount ? { wordCount } : {}),
  })

  return mergeSchemaOrgNodes(
    input.schemaOrg,
    [articleNode],
    breadcrumbNode,
  )
}

/**
 * Builds Schema.org nodes (`Article`/`BlogPosting` + optional `BreadcrumbList`)
 * for articles and notes, avoiding empty placeholder values (`""`, `[]`).
 */
export const buildArticleSchemaNodes = (
  options: ArticleSchemaOptions,
  resolvers: ArticleSchemaResolvers = {},
): Record<string, unknown>[] => {
  const doc = toValue(options.doc)
  if (!doc) return []

  const author = toValue(options.author)
  const authorSlug = toValue(options.authorSlug) ?? doc.author
  const schemaType = doc.schemaType ?? toValue(options.schemaType) ?? 'BlogPosting'
  const headline = doc.seo?.title ?? doc.title ?? undefined
  const summary = 'summary' in doc ? doc.summary : undefined
  const rawDescription = doc.seo?.description ?? summary ?? doc.description ?? undefined

  const contributorsPrefix = normalizePrefix(toValue(options.contributorsPrefix), '/contributors')
  const contributorsEnabled = toValue(options.contributorsEnabled) !== false
  const authorUrl = buildAuthorUrl(toValue(options.siteUrl), contributorsPrefix, authorSlug, contributorsEnabled)
  const authorImage = normalizeSchemaImage(author?.image?.src)

  const personNode = author?.name
    ? {
        '@type': 'Person' as const,
        'name': author.name,
        ...(authorUrl ? { url: authorUrl } : {}),
        ...(author.jobTitle ? { jobTitle: author.jobTitle } : {}),
        ...(author.honorificSuffix ? { honorificSuffix: author.honorificSuffix } : {}),
        ...(authorImage ? { image: authorImage } : {}),
      }
    : undefined

  return assembleArticleSchemaNodes(
    {
      schemaType,
      headline,
      rawDescription,
      imageSrc: doc.image?.src,
      publishedAt: doc.publishedAt,
      updatedAt: doc.updatedAt,
      authors: personNode ? [personNode] : undefined,
      section: toValue(options.section),
      keywords: toValue(options.keywords),
      explicitWordCount: toValue(options.wordCount),
      body: doc.body,
      breadcrumbs: toValue(options.breadcrumbs) || [],
      breadcrumbTitle: headline ?? doc.title,
      currentPath: doc.path,
      schemaOrg: doc.schemaOrg,
    },
    resolvers,
  )
}

export interface DocSchemaOptions {
  /** Documentation page item */
  doc: MaybeRefOrGetter<Doc | null | undefined>
  /** Module-level default `@type` when frontmatter `schemaType` is not set (defaults to `'TechArticle'`) */
  schemaType?: MaybeRefOrGetter<ArticleSchemaType | undefined>
  /** Parent UI breadcrumb items; the current doc is appended automatically */
  breadcrumbs?: MaybeRefOrGetter<BreadcrumbItem[] | undefined>
  /** Primary category/section name */
  section?: MaybeRefOrGetter<string | undefined>
  /** Explicit public path override for breadcrumbs when `routePrefix` is customized */
  path?: MaybeRefOrGetter<string | undefined>
  /** Explicit word count override (computed from `doc.body` when omitted) */
  wordCount?: MaybeRefOrGetter<number | undefined>
}

/**
 * Builds Schema.org nodes (`TechArticle` by default + optional `BreadcrumbList`)
 * for documentation pages without requiring `publishedAt` or `author`.
 */
export const buildDocSchemaNodes = (
  options: DocSchemaOptions,
  resolvers: ArticleSchemaResolvers = {},
): Record<string, unknown>[] => {
  const doc = toValue(options.doc)
  if (!doc) return []

  const schemaType = doc.schemaType ?? toValue(options.schemaType) ?? 'TechArticle'
  const headline = doc.seo?.title ?? doc.title ?? undefined
  const rawDescription = doc.seo?.description ?? doc.description ?? undefined

  return assembleArticleSchemaNodes(
    {
      schemaType,
      headline,
      rawDescription,
      imageSrc: doc.image?.src,
      publishedAt: doc.publishedAt,
      updatedAt: doc.updatedAt,
      section: toValue(options.section),
      explicitWordCount: toValue(options.wordCount),
      body: doc.body,
      breadcrumbs: toValue(options.breadcrumbs) || [],
      breadcrumbTitle: doc.title ?? headline,
      currentPath: toValue(options.path) ?? doc.path,
      schemaOrg: doc.schemaOrg,
    },
    resolvers,
  )
}

export interface FaqQuestionInput {
  question: string
  answer: string
}

export interface FaqSchemaResolvers {
  webPage?: (node: Record<string, unknown>) => Record<string, unknown>
  question?: (node: { name: string, acceptedAnswer: string }) => Record<string, unknown>
}

/**
 * Builds `FAQPage` WebPage node + root `Question` nodes with Markdown stripped
 * from question names and answers. Returns `[]` when no valid items exist.
 */
export const buildFaqSchemaNodes = (
  questions?: FaqQuestionInput[],
  resolvers: FaqSchemaResolvers = {},
): Record<string, unknown>[] => {
  if (!questions?.length) return []

  const cleaned = questions
    .map(item => ({
      name: stripMarkdown(item.question),
      acceptedAnswer: stripMarkdown(item.answer),
    }))
    .filter(item => Boolean(item.name && item.acceptedAnswer))

  if (cleaned.length === 0) return []

  const wrapWebPage = resolvers.webPage ?? (node => node)
  const wrapQuestion = resolvers.question ?? (item => ({
    '@type': 'Question',
    'name': item.name,
    'acceptedAnswer': {
      '@type': 'Answer',
      'text': item.acceptedAnswer,
    },
  }))

  return [
    wrapWebPage({ '@type': 'FAQPage' }),
    ...cleaned.map(item => wrapQuestion(item)),
  ]
}

const toIsoDateString = (value?: Date | string): string | undefined => {
  if (!value) return undefined
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString()
  }
  const trimmed = String(value).trim()
  return trimmed || undefined
}

export interface ArticleSeoMetaResult {
  title?: string
  description?: string
  ogType: 'article'
  articlePublishedTime?: string
  articleModifiedTime?: string
  articleTag?: string[]
  ogImage?: string
}

export interface ArticleSeoMetaDoc {
  title?: string
  description?: string
  publishedAt?: Date | string
  updatedAt?: Date | string
  image?: { src?: string, alt?: string }
  seo?: Partial<ArticleSeoMetaResult> & Record<string, unknown>
}

/**
 * Builds `useSeoMeta` properties for articles and notes with Open Graph article
 * metadata (`ogType: 'article'`, `articlePublishedTime`, `articleModifiedTime`,
 * `articleTag`, and `ogImage` fallback) while preserving explicit frontmatter `seo` overrides.
 */
export const buildArticleSeoMeta = (
  doc: ArticleSeoMetaDoc | null | undefined,
  options: { tags?: string[] } = {},
): ArticleSeoMetaResult => {
  if (!doc) {
    return { ogType: 'article' }
  }

  const seo = (doc.seo && typeof doc.seo === 'object') ? doc.seo : {}
  const seoTitle = typeof seo.title === 'string' ? seo.title.trim() : ''
  const seoDescription = typeof seo.description === 'string' ? seo.description.trim() : ''
  const title = seoTitle || doc.title?.trim() || undefined
  const description = seoDescription || doc.description?.trim() || undefined
  const publishedTime = toIsoDateString(doc.publishedAt)
  const modifiedTime = toIsoDateString(doc.updatedAt)
  const fallbackImage = normalizeSchemaImage(doc.image?.src)
  const seoOgImage = typeof seo.ogImage === 'string' ? seo.ogImage.trim() : ''
  const tags = options.tags?.map(tag => tag.trim()).filter(Boolean)

  const extraSeo = Object.fromEntries(
    Object.entries(seo).filter(([key, value]) =>
      key !== 'title'
      && key !== 'description'
      && key !== 'ogImage'
      && value !== undefined,
    ),
  ) as Partial<ArticleSeoMetaResult>

  return {
    ...extraSeo,
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ogType: 'article',
    ...(publishedTime ? { articlePublishedTime: publishedTime } : {}),
    ...(modifiedTime ? { articleModifiedTime: modifiedTime } : {}),
    ...(tags?.length ? { articleTag: tags } : {}),
    ...((seoOgImage || fallbackImage) ? { ogImage: seoOgImage || fallbackImage } : {}),
  }
}
