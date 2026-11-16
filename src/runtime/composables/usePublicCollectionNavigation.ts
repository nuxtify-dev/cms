import type { ContentNavigationItem, PageCollections } from '@nuxt/content'
import type { PublicCollectionChainablePromise } from '../types/content'
import { queryCollectionNavigation } from '#imports'

/**
 * Wrapper around `@nuxt/content`'s `queryCollectionNavigation` that excludes draft items
 * in production builds (`import.meta.env.PROD`).
 */
export function usePublicCollectionNavigation<T extends keyof PageCollections>(
  collection: T,
  fields?: Array<keyof PageCollections[T]>,
): PublicCollectionChainablePromise<T, ContentNavigationItem[]> {
  const query = queryCollectionNavigation(collection, fields)
  if (import.meta.env.PROD) {
    // `.where` expects a field key; `draft` exists on all `@nuxtify/cms` page collections.
    query.where('draft' as keyof PageCollections[T], '=', false)
  }
  return query
}
