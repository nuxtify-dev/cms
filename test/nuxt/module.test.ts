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

interface AfterParsePayload {
  collection: { name: string }
  content: Record<string, unknown>
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
    const afterParseHooks: Array<(ctx: AfterParsePayload) => void> = []
    const nuxt: MockNuxt = {
      version: '4.0.0',
      options: {
        dev: false,
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
        else if (name === 'content:file:afterParse') {
          afterParseHooks.push(cb as (ctx: AfterParsePayload) => void)
        }
      },
      callHook: async () => {},
    }
    nuxtCtx.set(nuxt as unknown as Nuxt, true)
    return { nuxt, pages, imports, afterParseHooks }
  }

  it('enables all routes and produces no sitemap excludes by default', async () => {
    const { nuxt, pages } = createMockNuxt()

    await runModule({}, nuxt as unknown as Nuxt)

    expect(nuxt.options.appConfig.nuxtify?.content?.articles?.enabled).toBe(true)
    expect(nuxt.options.appConfig.nuxtify?.content?.notes?.enabled).toBe(true)
    expect(nuxt.options.appConfig.nuxtify?.content?.topics?.enabled).toBe(true)
    expect(nuxt.options.appConfig.nuxtify?.content?.contributors?.enabled).toBe(true)
    expect(nuxt.options.appConfig.nuxtify?.content?.tags?.enabled).toBe(true)
    expect((nuxt.options.appConfig.nuxtify?.content?.articles as { schemaType?: string } | undefined)?.schemaType).toBe('Article')
    expect((nuxt.options.appConfig.nuxtify?.content?.notes as { schemaType?: string } | undefined)?.schemaType).toBe('BlogPosting')
    expect(JSON.stringify(nuxt.options.plugins)).toContain('brandFallback')

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

  it('excludes draft items from sitemap and robots in production via content:file:afterParse', async () => {
    const { nuxt, afterParseHooks } = createMockNuxt({ dev: false })
    await runModule({}, nuxt as unknown as Nuxt)

    expect(afterParseHooks.length).toBeGreaterThan(0)

    const draftArticle: Record<string, unknown> = {
      stem: 'articles/secret',
      path: '/articles/secret',
      draft: true,
      sitemap: { lastmod: '2026-05-01' },
    }
    afterParseHooks[0]?.({ collection: { name: 'articles' }, content: draftArticle })
    expect(draftArticle.sitemap).toBe(false)
    expect(draftArticle.robots).toBe(false)

    const draftPage: Record<string, unknown> = {
      stem: 'wip',
      path: '/wip',
      draft: true,
    }
    afterParseHooks[0]?.({ collection: { name: 'pages' }, content: draftPage })
    expect(draftPage.sitemap).toBe(false)
    expect(draftPage.robots).toBe(false)

    // Dev mode leaves drafts visible for preview
    const { nuxt: devNuxt, afterParseHooks: devHooks } = createMockNuxt({ dev: true })
    await runModule({}, devNuxt as unknown as Nuxt)
    const devDraft: Record<string, unknown> = {
      stem: 'articles/wip',
      path: '/articles/wip',
      draft: true,
    }
    devHooks[0]?.({ collection: { name: 'articles' }, content: devDraft })
    expect(devDraft.sitemap).toEqual({ loc: '/articles/wip' })
    expect(devDraft.robots).toBeUndefined()
  })

  it('excludes disabled collections regardless of folder path and maps custom routePrefix loc', async () => {
    const { nuxt, afterParseHooks } = createMockNuxt({ dev: false })
    await runModule({
      content: {
        articles: { routePrefix: '/blog' },
        notes: { enabled: false },
        tags: { description: 'Custom tag archive summary.' },
      },
    }, nuxt as unknown as Nuxt)

    expect((nuxt.options.appConfig.nuxtify?.content?.tags as { description?: string } | undefined)?.description)
      .toBe('Custom tag archive summary.')

    const postInArticlesFolder: Record<string, unknown> = {
      stem: 'articles/hello',
      path: '/articles/hello',
      sitemap: { lastmod: '2026-06-01' },
    }
    afterParseHooks[0]?.({ collection: { name: 'articles' }, content: postInArticlesFolder })
    expect(postInArticlesFolder.sitemap).toEqual({
      lastmod: '2026-06-01',
      loc: '/blog/hello',
    })

    const explicitLocPost: Record<string, unknown> = {
      stem: 'articles/override',
      path: '/articles/override',
      sitemap: { loc: '/custom/override' },
    }
    afterParseHooks[0]?.({ collection: { name: 'articles' }, content: explicitLocPost })
    expect(explicitLocPost.sitemap).toEqual({ loc: '/custom/override' })

    const optedOutPost: Record<string, unknown> = {
      stem: 'articles/hidden',
      path: '/articles/hidden',
      sitemap: false,
    }
    afterParseHooks[0]?.({ collection: { name: 'articles' }, content: optedOutPost })
    expect(optedOutPost.sitemap).toBe(false)

    const disabledNote: Record<string, unknown> = {
      stem: 'journal/entry',
      path: '/journal/entry',
      sitemap: { lastmod: '2026-06-01' },
    }
    afterParseHooks[0]?.({ collection: { name: 'notes' }, content: disabledNote })
    expect(disabledNote.sitemap).toBe(false)
  })
})
