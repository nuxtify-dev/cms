/**
 * Normalizes a URL route prefix to guarantee a leading slash and no trailing slash.
 */
export function normalizePrefix(prefix?: string, fallback: string = ''): string {
  if (!prefix || typeof prefix !== 'string') return fallback
  const cleaned = prefix.trim().replace(/^\/+|\/+$/g, '')
  return cleaned ? `/${cleaned}` : fallback
}

/**
 * Extracts the trailing slug from a content item stem, path, or string identifier.
 */
export function extractSlug(item?: { stem?: string, path?: string } | string): string {
  if (!item) return ''
  if (typeof item === 'string') {
    return item.split('/').filter(Boolean).pop() || ''
  }
  const source = item.stem || item.path || ''
  return source.split('/').filter(Boolean).pop() || ''
}

/**
 * Generates the permalink for a content item given a route prefix.
 */
export function getContentItemLink(
  prefix: string,
  item?: { stem?: string, path?: string } | string,
): string {
  const slug = extractSlug(item)
  const normalized = normalizePrefix(prefix)
  return slug ? `${normalized}/${slug}` : normalized
}

/**
 * Detects `@nuxt/content` `.navigation` directory metadata items that are not standalone pages.
 */
export function isNavigationMetaItem(item?: { stem?: string, path?: string }): boolean {
  if (!item) return false
  const stem = item.stem || ''
  const path = item.path || ''
  return stem === '.navigation'
    || stem.endsWith('/.navigation')
    || path === '/.navigation'
    || path.endsWith('/.navigation')
}

/**
 * Generates the permalink for a nested documentation item given a route prefix.
 * Preserves the hierarchy beneath `/docs` (or the prefix segment) while stripping numeric ordering prefixes.
 */
export function getDocsItemLink(
  prefix: string,
  item?: { stem?: string, path?: string } | string,
): string {
  const normalized = normalizePrefix(prefix, '/docs')
  if (!item) return normalized

  let segments: string[] = []
  if (typeof item === 'string') {
    segments = item.split('/').filter(Boolean).map(seg => seg.replace(/^\d+\./, ''))
  }
  else if (item.path) {
    segments = item.path.split('/').filter(Boolean)
  }
  else if (item.stem) {
    segments = item.stem.split('/').filter(Boolean).map(seg => seg.replace(/^\d+\./, ''))
  }

  if (segments[segments.length - 1] === 'index') {
    segments.pop()
  }

  const prefixSegments = normalized.split('/').filter(Boolean)
  if (
    prefixSegments.length > 0
    && segments.length >= prefixSegments.length
    && prefixSegments.every((seg, i) => segments[i] === seg)
  ) {
    segments.splice(0, prefixSegments.length)
  }
  else if (segments[0] === 'docs') {
    segments.shift()
  }

  return segments.length ? `${normalized}/${segments.join('/')}` : normalized
}

export interface ContentSitemapRule {
  enabled: boolean
  routePrefix: string
}

export interface ContentAfterParseContext {
  collectionName: string
  content: Record<string, unknown>
  isDev: boolean
  collections: Partial<Record<'articles' | 'notes' | 'topics' | 'contributors' | 'docs', ContentSitemapRule>>
}

/**
 * Normalizes `sitemap` and `robots` metadata for parsed `@nuxt/content` items:
 * - Excludes `.navigation` directory config items from sitemap and search indexing.
 * - Excludes `draft: true` items from sitemap and search indexing outside dev mode.
 * - Excludes items belonging to disabled collections regardless of folder path.
 * - Maps collection items to their configured `routePrefix` permalink in `sitemap.loc`
 *   unless `sitemap` is disabled (`false`), `robots` disallows indexing, or `sitemap.loc` is set.
 */
export function applyContentSitemapMeta(ctx: ContentAfterParseContext): void {
  const { collectionName, content, isDev, collections } = ctx

  if (isNavigationMetaItem(content as { stem?: string, path?: string })) {
    content.sitemap = false
    content.robots = false
    return
  }

  if (!isDev && content.draft === true) {
    content.sitemap = false
    content.robots = false
    return
  }

  const rule = collections[collectionName as keyof typeof collections]
  if (!rule) return

  if (!rule.enabled) {
    content.sitemap = false
    return
  }

  const robotsDisabled = content.robots === false
    || (typeof content.robots === 'string' && content.robots.toLowerCase().includes('noindex'))
  if (content.sitemap === false || robotsDisabled) {
    return
  }

  const loc = collectionName === 'docs'
    ? getDocsItemLink(rule.routePrefix, content as { stem?: string, path?: string })
    : getContentItemLink(rule.routePrefix, content as { stem?: string, path?: string })
  if (!loc) return

  const existingSitemap = (content.sitemap && typeof content.sitemap === 'object')
    ? (content.sitemap as Record<string, unknown>)
    : {}
  if (typeof existingSitemap.loc === 'string' && existingSitemap.loc.trim()) {
    return
  }

  content.sitemap = {
    ...existingSitemap,
    loc,
  }
}
