import type { Nuxt, NuxtPage } from '@nuxt/schema'
import { describe, expect, it } from 'vitest'
import { nuxtCtx } from '@nuxt/kit'
import cmsModule from '../../src/module'
import type { ModuleOptions } from '../../src/types/module'

interface MockNuxtOptions {
  plugins?: unknown[]
  appConfig: {
    nuxtify?: {
      content?: {
        articles?: { enabled?: boolean }
        notes?: { enabled?: boolean }
        topics?: { enabled?: boolean }
        contributors?: { enabled?: boolean }
        tags?: { enabled?: boolean }
      }
    }
  }
  sitemap: {
    exclude?: string[]
  }
  buildDir: string
  [key: string]: unknown
}

interface MockImport {
  name: string
  as?: string
  from: string
}

interface MockNuxt {
  version: string
  options: MockNuxtOptions
  hook: (name: string, cb: (arg: never) => void) => void
  callHook: () => Promise<void>
}

type ModuleRunner = (options: ModuleOptions, nuxt: Nuxt) => Promise<unknown>
const runModule = cmsModule as unknown as ModuleRunner

describe('cms module enabled flags and sitemap exclusions', () => {
  const createMockNuxt = (
    customOptions: Partial<MockNuxtOptions> = {},
    imports: MockImport[] = [],
  ) => {
    const pages: NuxtPage[] = []
    const nuxt: MockNuxt = {
      version: '4.0.0',
      options: {
        plugins: [],
        appConfig: {},
        sitemap: {},
        buildDir: '.nuxt',
        ...customOptions,
      },
      hook: (name: string, cb: (arg: never) => void) => {
        if (name === 'pages:extend') {
          (cb as (pages: NuxtPage[]) => void)(pages)
        }
        else if (name === 'imports:extend') {
          (cb as (imports: MockImport[]) => void)(imports)
        }
      },
      callHook: async () => {},
    }
    nuxtCtx.set(nuxt as unknown as Nuxt, true)
    return { nuxt, pages, imports }
  }

  it('enables all routes and produces no sitemap excludes by default', async () => {
    const { nuxt, pages } = createMockNuxt()

    await runModule({}, nuxt as unknown as Nuxt)

    expect(nuxt.options.appConfig.nuxtify?.content?.articles?.enabled).toBe(true)
    expect(nuxt.options.appConfig.nuxtify?.content?.notes?.enabled).toBe(true)
    expect(nuxt.options.appConfig.nuxtify?.content?.topics?.enabled).toBe(true)
    expect(nuxt.options.appConfig.nuxtify?.content?.contributors?.enabled).toBe(true)
    expect(nuxt.options.appConfig.nuxtify?.content?.tags?.enabled).toBe(true)

    expect(nuxt.options.sitemap.exclude).toBeUndefined()
    const pageNames = pages.map(p => p.name)
    expect(pageNames).toContain('articles')
    expect(pageNames).toContain('articles-slug')
    expect(pageNames).toContain('notes')
    expect(pageNames).toContain('notes-slug')
    expect(pageNames).toContain('tags-slug')
    expect(pageNames).toContain('topics')
    expect(pageNames).toContain('topics-slug')
    expect(pageNames).toContain('contributors')
    expect(pageNames).toContain('contributors-slug')
  })

  it('excludes articles routes and adds sitemap exclude when articles.enabled is false', async () => {
    const { nuxt, pages } = createMockNuxt()

    await runModule({
      content: {
        articles: {
          enabled: false,
          routePrefix: '/blog',
        },
      },
    }, nuxt as unknown as Nuxt)

    expect(nuxt.options.appConfig.nuxtify?.content?.articles?.enabled).toBe(false)
    expect(nuxt.options.sitemap.exclude).toContain('/blog')
    expect(nuxt.options.sitemap.exclude).toContain('/blog/**')

    const pageNames = pages.map(p => p.name)
    expect(pageNames).not.toContain('articles')
    expect(pageNames).not.toContain('articles-slug')
  })

  it('excludes notes and tags when notes.enabled is false', async () => {
    const { nuxt, pages } = createMockNuxt()

    await runModule({
      content: {
        notes: {
          enabled: false,
        },
      },
    }, nuxt as unknown as Nuxt)

    expect(nuxt.options.appConfig.nuxtify?.content?.notes?.enabled).toBe(false)
    expect(nuxt.options.appConfig.nuxtify?.content?.tags?.enabled).toBe(false)
    expect(nuxt.options.sitemap.exclude).toContain('/notes')
    expect(nuxt.options.sitemap.exclude).toContain('/notes/**')
    expect(nuxt.options.sitemap.exclude).toContain('/tags')
    expect(nuxt.options.sitemap.exclude).toContain('/tags/**')

    const pageNames = pages.map(p => p.name)
    expect(pageNames).not.toContain('notes')
    expect(pageNames).not.toContain('notes-slug')
    expect(pageNames).not.toContain('tags-slug')
  })

  it('excludes topics and contributors when disabled', async () => {
    const { nuxt, pages } = createMockNuxt({
      sitemap: {
        exclude: ['/existing-exclude'],
      },
    })

    await runModule({
      content: {
        topics: {
          enabled: false,
        },
        contributors: {
          enabled: false,
        },
      },
    }, nuxt as unknown as Nuxt)

    expect(nuxt.options.appConfig.nuxtify?.content?.topics?.enabled).toBe(false)
    expect(nuxt.options.appConfig.nuxtify?.content?.contributors?.enabled).toBe(false)
    expect(nuxt.options.sitemap.exclude).toContain('/existing-exclude')
    expect(nuxt.options.sitemap.exclude).toContain('/topics')
    expect(nuxt.options.sitemap.exclude).toContain('/topics/**')
    expect(nuxt.options.sitemap.exclude).toContain('/contributors')
    expect(nuxt.options.sitemap.exclude).toContain('/contributors/**')

    const pageNames = pages.map(p => p.name)
    expect(pageNames).not.toContain('topics')
    expect(pageNames).not.toContain('topics-slug')
    expect(pageNames).not.toContain('contributors')
    expect(pageNames).not.toContain('contributors-slug')
  })

  it('excludes tags when tags.enabled is false', async () => {
    const { nuxt, pages } = createMockNuxt()

    await runModule({
      content: {
        tags: {
          enabled: false,
        },
      },
    }, nuxt as unknown as Nuxt)

    expect(nuxt.options.appConfig.nuxtify?.content?.tags?.enabled).toBe(false)
    expect(nuxt.options.sitemap.exclude).toContain('/tags')
    expect(nuxt.options.sitemap.exclude).toContain('/tags/**')

    const pageNames = pages.map(p => p.name)
    expect(pageNames).not.toContain('tags-slug')
  })

  it('overrides useNuxtifyConfig imports from @nuxtify/core and @nuxtify/pages', async () => {
    const imports: MockImport[] = [
      { name: 'useNuxtifyConfig', from: '@nuxtify/core/dist/runtime/composables/nuxtify' },
      { name: 'useNuxtifyConfig', from: '@nuxtify/pages/dist/runtime/composables/nuxtify' },
      { name: 'useNuxtifyConfig', from: '/src/runtime/composables/nuxtify' },
      { name: 'useDialog', from: '@nuxtify/core/dist/runtime/composables/dialog' },
    ]
    const { nuxt } = createMockNuxt({}, imports)

    await runModule({
      email: {
        general: 'hello@example.com',
        support: 'support@example.com',
        reply: 'reply@example.com',
        provider: {
          defaultSubmitUrl: 'https://example.com/subscribe',
        },
      },
      navigation: {
        primary: [
          { text: 'Home', to: '/' },
          {
            title: 'CMS',
            links: [
              { text: 'Articles', description: 'Read posts', icon: 'mdi-post', to: '/articles' },
            ],
          },
        ],
      },
    }, nuxt as unknown as Nuxt)

    expect(imports).toEqual([
      { name: 'useNuxtifyConfig', from: '/src/runtime/composables/nuxtify' },
      { name: 'useDialog', from: '@nuxtify/core/dist/runtime/composables/dialog' },
    ])
  })
})
