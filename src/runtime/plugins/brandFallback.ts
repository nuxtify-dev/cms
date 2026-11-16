import {
  buildBrandSiteConfigFallback,
  defineNuxtPlugin,
  useNuxtApp,
  useNuxtifyConfig,
  useRequestEvent,
} from '#imports'

interface SiteConfigStackLike {
  push: (input: Record<string, unknown>) => void
}

export default defineNuxtPlugin({
  name: 'nuxtify-cms:brand-fallback',
  enforce: 'pre',
  dependsOn: ['nuxt-site-config:init'],
  setup() {
    const nuxtApp = useNuxtApp()
    const stack = (import.meta.server
      ? useRequestEvent()?.context?.siteConfig
      : nuxtApp.$nuxtSiteConfig) as SiteConfigStackLike | undefined

    if (!stack || typeof stack.push !== 'function') {
      return
    }

    const brand = useNuxtifyConfig()?.brand
    const fallback = buildBrandSiteConfigFallback(brand)
    if (fallback) {
      stack.push(fallback)
    }
  },
})
