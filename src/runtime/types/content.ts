import type {
  PageCollections,
  QueryGroupFunction,
  SQLOperator,
} from '@nuxt/content'

/**
 * Publicly nameable mirror of `@nuxt/content`'s internal `ChainablePromise` interface.
 * Required so exported composables returning navigation or surroundings queries can emit
 * `.d.ts` declarations without triggering TS4058.
 */
export interface PublicCollectionChainablePromise<T extends keyof PageCollections, R> extends Promise<R> {
  where(field: keyof PageCollections[T] | string, operator: SQLOperator, value?: unknown): PublicCollectionChainablePromise<T, R>
  andWhere(groupFactory: QueryGroupFunction<PageCollections[T]>): PublicCollectionChainablePromise<T, R>
  orWhere(groupFactory: QueryGroupFunction<PageCollections[T]>): PublicCollectionChainablePromise<T, R>
  order(field: keyof PageCollections[T], direction: 'ASC' | 'DESC'): PublicCollectionChainablePromise<T, R>
}
