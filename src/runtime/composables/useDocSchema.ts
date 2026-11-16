import { computed } from 'vue'
import {
  buildDocSchemaNodes,
  type DocSchemaOptions,
} from '../utils/seo'
import { useNuxtifyConfig } from './nuxtify'
import {
  defineArticle,
  defineBreadcrumb,
  useSchemaOrg,
} from '#imports'

export type UseDocSchemaOptions = DocSchemaOptions

/**
 * Registers reactive Schema.org structured data (`TechArticle` + `BreadcrumbList`)
 * for documentation pages using runtime module defaults.
 */
export function useDocSchema(options: UseDocSchemaOptions) {
  const nuxtifyConfig = useNuxtifyConfig()

  const nodes = computed(() =>
    buildDocSchemaNodes(
      {
        ...options,
        schemaType: options.schemaType ?? nuxtifyConfig.content?.docs?.schemaType ?? 'TechArticle',
      },
      {
        article: node => defineArticle(node as Parameters<typeof defineArticle>[0]),
        breadcrumb: node => defineBreadcrumb(node as Parameters<typeof defineBreadcrumb>[0]),
      },
    ),
  )

  useSchemaOrg(nodes)
}
