import type { Collections } from '@nuxt/content'
import { queryCollection } from '#imports'

export const usePublicCollection = <T extends keyof Collections>(collection: T) => {
  const query = queryCollection(collection)
  if (import.meta.env.PROD) {
    query.where('draft', '=', false)
  }
  return query
}
