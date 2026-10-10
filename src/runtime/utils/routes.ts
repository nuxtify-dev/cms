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
