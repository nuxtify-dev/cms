import type { PageCollections, SurroundOptions } from '@nuxt/content'
import { queryCollectionItemSurroundings } from '#imports'

/**
 * Wrapper around `@nuxt/content`'s `queryCollectionItemSurroundings` that excludes draft items
 * in production builds (`import.meta.env.PROD`).
 */
export function usePublicCollectionSurroundings<T extends keyof PageCollections>(
  collection: T,
  path: string,
  opts?: SurroundOptions<keyof PageCollections[T]>,
) {
  const query = queryCollectionItemSurroundings(collection, path, opts)
  if (import.meta.env.PROD) {
    query.where('draft' as keyof PageCollections[T], '=', false)
  }
  return query
}
