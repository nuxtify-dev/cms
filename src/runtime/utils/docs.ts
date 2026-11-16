import type { ContentNavigationItem } from '@nuxt/content'
import type { BreadcrumbItem } from '../../types/link'
import { isNavigationMetaItem, normalizePrefix } from './routes'

export interface DocCategoryTab {
  title: string
  path: string
  to: string
  icon?: string
  active: boolean
}

export interface DocsNavigationState {
  categories: DocCategoryTab[]
  activeCategory: ContentNavigationItem | null
  sidebarItems: ContentNavigationItem[]
}

/**
 * Normalizes a URL path for comparison (ensures leading slash, strips query/hash and trailing slash).
 */
export function normalizeDocRoutePath(path?: string): string {
  if (!path) return '/'
  const withoutHash = path.split('#')[0] || ''
  const withoutQuery = withoutHash.split('?')[0] || ''
  const cleaned = withoutQuery.trim().replace(/^\/+|\/+$/g, '')
  return cleaned ? `/${cleaned}` : '/'
}

/**
 * Converts a `@nuxt/content` doc item path (typically `/docs/...`) to the configured `docsPrefix`.
 */
export function toDocsPublicPath(contentPath: string, docsPrefix: string = '/docs'): string {
  const normalizedPrefix = normalizePrefix(docsPrefix, '/docs')
  const cleanPath = normalizeDocRoutePath(contentPath)

  if (normalizedPrefix === '/docs') {
    return cleanPath === '/' ? '/docs' : cleanPath
  }

  if (cleanPath === '/docs') {
    return normalizedPrefix
  }

  if (cleanPath.startsWith('/docs/')) {
    return `${normalizedPrefix}${cleanPath.slice('/docs'.length)}`
  }

  if (cleanPath === normalizedPrefix || cleanPath.startsWith(`${normalizedPrefix}/`)) {
    return cleanPath
  }

  return `${normalizedPrefix}${cleanPath === '/' ? '' : cleanPath}`
}

/**
 * Maps an incoming public docs URL path back to a candidate `/docs/...` collection path
 * when `content.docs.routePrefix` differs from `/docs`.
 */
export function toDocsContentPath(publicPath: string, docsPrefix: string = '/docs'): string {
  const normalizedPrefix = normalizePrefix(docsPrefix, '/docs')
  const cleanPath = normalizeDocRoutePath(publicPath)

  if (normalizedPrefix === '/docs') {
    return cleanPath
  }

  if (cleanPath === normalizedPrefix) {
    return '/docs'
  }

  if (cleanPath.startsWith(`${normalizedPrefix}/`)) {
    return `/docs${cleanPath.slice(normalizedPrefix.length)}`
  }

  return cleanPath
}

function normalizeNavItems(items: ContentNavigationItem[], docsPrefix: string): ContentNavigationItem[] {
  const result: ContentNavigationItem[] = []
  for (const item of items) {
    if (isNavigationMetaItem(item)) continue

    const children = Array.isArray(item.children)
      ? normalizeNavItems(item.children, docsPrefix)
      : undefined

    result.push({
      ...item,
      path: toDocsPublicPath(item.path, docsPrefix),
      ...(children ? { children } : {}),
    })
  }
  return result
}

/**
 * Unwraps the root `/docs` directory node returned by `@nuxt/content`'s navigation generator
 * and rewrites all item paths to honor the configured `docsPrefix`.
 */
export function unwrapDocsNavigationRoot(
  tree: ContentNavigationItem[] = [],
  docsPrefix: string = '/docs',
): ContentNavigationItem[] {
  const normalizedPrefix = normalizePrefix(docsPrefix, '/docs')
  const normalized = normalizeNavItems(tree, normalizedPrefix)

  if (
    normalized.length === 1
    && normalizeDocRoutePath(normalized[0]?.path) === normalizedPrefix
    && Array.isArray(normalized[0]?.children)
    && normalized[0].children.length > 0
  ) {
    return normalized[0].children
  }

  return normalized
}

/**
 * Finds the first navigable document node in a navigation subtree (depth-first).
 */
export function findFirstDocLeaf(items: ContentNavigationItem[] = []): ContentNavigationItem | null {
  for (const item of items) {
    if (item.page !== false && item.path) {
      return item
    }
    if (Array.isArray(item.children) && item.children.length > 0) {
      const child = findFirstDocLeaf(item.children)
      if (child) return child
    }
  }
  return null
}

/**
 * Looks up a navigation node matching `targetPath` anywhere in the tree.
 */
export function resolveDocNavNode(
  items: ContentNavigationItem[] = [],
  targetPath: string = '',
): ContentNavigationItem | null {
  const normalizedTarget = normalizeDocRoutePath(targetPath)
  for (const item of items) {
    if (normalizeDocRoutePath(item.path) === normalizedTarget) {
      return item
    }
    if (Array.isArray(item.children) && item.children.length > 0) {
      const match = resolveDocNavNode(item.children, normalizedTarget)
      if (match) return match
    }
  }
  return null
}

function isNodeOrDescendantActive(item: ContentNavigationItem, normalizedCurrent: string): boolean {
  const itemPath = normalizeDocRoutePath(item.path)
  if (itemPath === normalizedCurrent) return true
  if (Array.isArray(item.children)) {
    return item.children.some(child => isNodeOrDescendantActive(child, normalizedCurrent))
  }
  return false
}

/**
 * Splits a top-level docs navigation list into:
 * - (1) Top main-category tabs when grouped directories exist
 * - (2) Left sidebar navigation items for the active category (or all flat docs when ungrouped)
 */
export function splitDocsNavigation(
  items: ContentNavigationItem[] = [],
  currentPath: string = '',
): DocsNavigationState {
  if (!items.length) {
    return {
      categories: [],
      activeCategory: null,
      sidebarItems: [],
    }
  }

  const normalizedCurrent = normalizeDocRoutePath(currentPath)
  const hasCategories = items.some(item => Array.isArray(item.children) && item.children.length > 0)

  if (!hasCategories) {
    return {
      categories: [],
      activeCategory: null,
      sidebarItems: items,
    }
  }

  const activeCategory = items.find(item => isNodeOrDescendantActive(item, normalizedCurrent)) || null

  const categories: DocCategoryTab[] = items.map((item) => {
    const active = item === activeCategory

    const firstTarget = item.page !== false
      ? item
      : findFirstDocLeaf(item.children)

    return {
      title: item.title,
      path: item.path,
      to: firstTarget?.path || item.path,
      icon: typeof item.icon === 'string' && item.icon ? item.icon : undefined,
      active,
    }
  })

  const sidebarItems = activeCategory?.children?.length
    ? activeCategory.children
    : []

  return {
    categories,
    activeCategory,
    sidebarItems,
  }
}

function findAncestorChain(
  items: ContentNavigationItem[],
  normalizedCurrent: string,
): ContentNavigationItem[] | null {
  for (const item of items) {
    if (normalizeDocRoutePath(item.path) === normalizedCurrent) {
      return [item]
    }
    if (Array.isArray(item.children) && item.children.length > 0) {
      const childChain = findAncestorChain(item.children, normalizedCurrent)
      if (childChain) {
        return [item, ...childChain]
      }
    }
  }
  return null
}

/**
 * Builds breadcrumb items from the navigation tree for the current doc path.
 */
export function buildDocsBreadcrumbs(
  items: ContentNavigationItem[] = [],
  currentPath: string = '',
): BreadcrumbItem[] {
  const normalizedCurrent = normalizeDocRoutePath(currentPath)
  const chain = findAncestorChain(items, normalizedCurrent)
  if (!chain || chain.length === 0) return []

  return chain.map((node, index) => {
    const isLast = index === chain.length - 1
    if (isLast) {
      return {
        title: node.title,
        disabled: true,
      }
    }
    const target = node.page !== false ? node : findFirstDocLeaf(node.children)
    return {
      title: node.title,
      to: target?.path,
    }
  })
}

/**
 * Rewrites Previous / Next surrounding links returned by `@nuxt/content` to use `docsPrefix`.
 */
export function rewriteDocsSurroundings(
  surroundings?: Array<ContentNavigationItem | null | undefined> | null,
  docsPrefix: string = '/docs',
): [ContentNavigationItem | null, ContentNavigationItem | null] {
  const prev = surroundings?.[0]
    ? { ...surroundings[0], path: toDocsPublicPath(surroundings[0].path, docsPrefix) }
    : null
  const next = surroundings?.[1]
    ? { ...surroundings[1], path: toDocsPublicPath(surroundings[1].path, docsPrefix) }
    : null

  return [prev, next]
}
