import type { MaybeRefOrGetter } from 'vue'
import {
  buildContentPageSchemaNodes,
  type ContentPageSchemaDoc,
  type ContentPageSchemaOptions,
} from '../utils/seo'
import {
  defineBreadcrumb,
  defineWebPage,
  useSchemaOrg,
} from '#imports'

export type UseContentPageSchemaOptions = ContentPageSchemaOptions

/**
 * Registers Schema.org structured data for content pages (`[...slug]`, `topics/[slug]`, collection indexes).
 */
export function useContentPageSchema(
  docRef: MaybeRefOrGetter<ContentPageSchemaDoc | null | undefined>,
  options: UseContentPageSchemaOptions = {},
) {
  const nodes = buildContentPageSchemaNodes(docRef, options, {
    webPage: node => defineWebPage(node as Parameters<typeof defineWebPage>[0]),
    breadcrumb: node => defineBreadcrumb(node as Parameters<typeof defineBreadcrumb>[0]),
  })

  if (nodes.length > 0) {
    useSchemaOrg(nodes)
  }
}
