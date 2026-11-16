import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Article, Contributor, Doc } from '../../src/types/content'
import {
  buildArticleSchemaNodes,
  buildContentPageSchemaNodes,
  buildDocSchemaNodes,
  buildFaqSchemaNodes,
} from '../../src/runtime/utils/seo'
import { useContributor } from '../../src/runtime/composables/useContributor'

const { mockFirst, mockWhere, mockPath, mockUsePublicCollection } = vi.hoisted(() => {
  const mockFirst = vi.fn()
  const mockWhere = vi.fn(() => ({ first: mockFirst }))
  const mockPath = vi.fn(() => ({ first: mockFirst }))
  const mockUsePublicCollection = vi.fn(() => ({
    path: mockPath,
    where: mockWhere,
  }))
  return { mockFirst, mockWhere, mockPath, mockUsePublicCollection }
})

vi.mock('../../src/runtime/composables/usePublicCollection', () => ({
  usePublicCollection: mockUsePublicCollection,
}))

vi.mock('../../src/runtime/composables/nuxtify', () => ({
  useNuxtifyConfig: () => ({
    content: {
      contributors: {
        routePrefix: '/team',
        enabled: true,
      },
    },
  }),
}))

const createMockArticle = (overrides: Partial<Article> = {}): Article => ({
  id: 'articles/hello.md',
  title: 'Hello World',
  description: 'Base description with **Markdown**.',
  path: '/articles/hello',
  stem: 'articles/hello',
  extension: 'md',
  meta: {},
  body: {
    type: 'minimark',
    value: [['p', {}, 'One two three four five.']],
  },
  seo: {
    title: 'Hello World SEO',
    description: 'Learn [Nuxt](https://nuxt.com) quickly.',
  },
  robots: {},
  sitemap: {},
  ogImage: false,
  schemaOrg: undefined,
  publishedAt: '2026-01-10',
  author: 'jane-doe',
  draft: false,
  topics: ['getting-started'],
  ...overrides,
} as Article)

const createMockContributor = (overrides: Partial<Contributor> = {}): Contributor => ({
  id: 'contributors/jane-doe.md',
  title: 'Jane Doe',
  description: 'Writes docs',
  path: '/contributors/jane-doe',
  stem: 'contributors/jane-doe',
  extension: 'md',
  meta: {},
  body: { type: 'minimark', value: [] },
  seo: {},
  robots: {},
  sitemap: {},
  ogImage: false,
  schemaOrg: undefined,
  name: 'Jane Doe',
  jobTitle: 'Staff Engineer',
  honorificSuffix: 'PhD',
  image: { src: 'content/contributors/jane.jpg', alt: 'Jane' },
  draft: false,
  ...overrides,
} as Contributor)

describe('schema composables', () => {
  beforeEach(() => {
    mockFirst.mockReset()
    mockWhere.mockClear()
    mockPath.mockClear()
    mockUsePublicCollection.mockClear()
  })

  describe('buildArticleSchemaNodes', () => {
    it('builds rich Article schema without empty placeholders and with computed wordCount', () => {
      const nodes = buildArticleSchemaNodes({
        doc: createMockArticle(),
        author: createMockContributor(),
        schemaType: 'Article',
        breadcrumbs: [
          { title: 'Articles', to: '/articles' },
          { title: 'Getting Started', to: '/topics/getting-started' },
        ],
        section: 'Getting Started',
        keywords: ['Getting Started'],
        siteUrl: 'https://example.com/',
        contributorsPrefix: '/team',
        contributorsEnabled: true,
      })

      expect(nodes).toHaveLength(2)
      expect(nodes[0]).toMatchObject({
        '@type': 'Article',
        'headline': 'Hello World SEO',
        'description': 'Learn Nuxt quickly.',
        'datePublished': '2026-01-10',
        'articleSection': 'Getting Started',
        'keywords': ['Getting Started'],
        'wordCount': 5,
        'author': [
          {
            '@type': 'Person',
            'name': 'Jane Doe',
            'url': 'https://example.com/team/jane-doe',
            'jobTitle': 'Staff Engineer',
            'honorificSuffix': 'PhD',
            'image': '/content/contributors/jane.jpg',
          },
        ],
      })
      expect(nodes[0]).not.toHaveProperty('dateModified')
      expect(nodes[1]).toMatchObject({
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { name: 'Articles', item: '/articles' },
          { name: 'Getting Started', item: '/topics/getting-started' },
          { name: 'Hello World SEO', item: '/articles/hello' },
        ],
      })
    })

    it('lets frontmatter schemaType override module default and omits missing author instead of []', () => {
      const nodes = buildArticleSchemaNodes({
        doc: createMockArticle({
          schemaType: 'TechArticle',
          image: { src: 'articles/cover.png', alt: 'Cover' },
        }),
        author: null,
        schemaType: 'BlogPosting',
        keywords: [],
      })

      expect(nodes).toHaveLength(1)
      expect(nodes[0]).toMatchObject({
        '@type': 'TechArticle',
        'image': '/articles/cover.png',
      })
      expect(nodes[0]).not.toHaveProperty('author')
      expect(nodes[0]).not.toHaveProperty('keywords')
    })

    it('preserves frontmatter schemaOrg override while appending BreadcrumbList', () => {
      const nodes = buildArticleSchemaNodes({
        doc: createMockArticle({
          schemaOrg: { '@type': 'NewsArticle', 'headline': 'Custom News' },
        }),
        breadcrumbs: [{ title: 'Articles', to: '/articles' }],
      })

      expect(nodes).toHaveLength(2)
      expect(nodes[0]).toEqual({ '@type': 'NewsArticle', 'headline': 'Custom News' })
      expect(nodes[1]).toMatchObject({ '@type': 'BreadcrumbList' })
    })
  })

  describe('buildContentPageSchemaNodes', () => {
    it('builds WebPage / CollectionPage with stripped description and appends BreadcrumbList only when >= 2 items', () => {
      const singlePageNodes = buildContentPageSchemaNodes({
        title: 'Home',
        description: '**Welcome** home.',
        path: '/',
        image: { src: 'images/home.png' },
      })

      expect(singlePageNodes).toHaveLength(1)
      expect(singlePageNodes[0]).toMatchObject({
        name: 'Home',
        description: 'Welcome home.',
        image: '/images/home.png',
      })

      const topicNodes = buildContentPageSchemaNodes(
        {
          title: 'Nuxt',
          description: 'All *Nuxt* articles.',
          path: '/topics/nuxt',
        },
        {
          type: 'CollectionPage',
          breadcrumbs: [
            { title: 'Home', to: '/' },
            { title: 'Topics', to: '/topics' },
          ],
        },
      )

      expect(topicNodes).toHaveLength(2)
      expect(topicNodes[0]).toMatchObject({
        '@type': 'CollectionPage',
        'name': 'Nuxt',
        'description': 'All Nuxt articles.',
      })
      expect(topicNodes[1]).toMatchObject({
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { name: 'Home', item: '/' },
          { name: 'Topics', item: '/topics' },
          { name: 'Nuxt', item: '/topics/nuxt' },
        ],
      })
    })
  })

  describe('buildFaqSchemaNodes', () => {
    it('returns empty array when questions are empty or whitespace-only', () => {
      expect(buildFaqSchemaNodes([])).toEqual([])
      expect(buildFaqSchemaNodes([{ question: 'Q', answer: '   ' }])).toEqual([])
    })

    it('emits FAQPage WebPage node alongside root Question nodes with stripped Markdown', () => {
      const nodes = buildFaqSchemaNodes([
        {
          question: '**What** is Nuxtify CMS?',
          answer: 'Read [the guide](/docs) for **more details**.',
        },
        {
          question: 'Skipped?',
          answer: '',
        },
      ])

      expect(nodes).toHaveLength(2)
      expect(nodes[0]).toEqual({ '@type': 'FAQPage' })
      expect(nodes[1]).toEqual({
        '@type': 'Question',
        'name': 'What is Nuxtify CMS?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Read the guide for more details.',
        },
      })
    })
  })

  describe('useContributor', () => {
    it('queries the configured contributorsPrefix and falls back to stem LIKE lookup', async () => {
      const fallbackContributor = createMockContributor({ path: '/team/jane-doe' })
      mockFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(fallbackContributor)

      const { data } = await useContributor('jane-doe')

      expect(mockPath).toHaveBeenCalledWith('/team/jane-doe')
      expect(mockWhere).toHaveBeenCalledWith('stem', 'LIKE', '%/jane-doe')
      expect(data.value).toEqual(fallbackContributor)
    })
  })

  describe('buildDocSchemaNodes', () => {
    const createMockDoc = (overrides: Partial<Doc> = {}): Doc => ({
      id: 'docs/1.getting-started/1.introduction.md',
      title: 'Introduction',
      description: 'Get started with **Nuxtify CMS**.',
      path: '/docs/getting-started/introduction',
      stem: 'docs/1.getting-started/1.introduction',
      extension: 'md',
      meta: {},
      body: {
        type: 'minimark',
        value: [['p', {}, 'One two three four five six.']],
      },
      seo: {},
      robots: {},
      sitemap: {},
      ogImage: false,
      schemaOrg: undefined,
      toc: true,
      prevNext: true,
      draft: false,
      ...overrides,
    } as Doc)

    it('emits TechArticle and BreadcrumbList without requiring publishedAt or author', () => {
      const nodes = buildDocSchemaNodes({
        doc: createMockDoc(),
        section: 'Get Started',
        breadcrumbs: [
          { title: 'Get Started', to: '/docs/getting-started/introduction' },
        ],
      })

      expect(nodes).toHaveLength(2)
      expect(nodes[0]).toMatchObject({
        '@type': 'TechArticle',
        'headline': 'Introduction',
        'description': 'Get started with Nuxtify CMS.',
        'articleSection': 'Get Started',
        'wordCount': 6,
      })
      expect(nodes[0]).not.toHaveProperty('datePublished')
      expect(nodes[0]).not.toHaveProperty('author')
      expect(nodes[1]).toMatchObject({
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { name: 'Get Started', item: '/docs/getting-started/introduction' },
          { name: 'Introduction', item: '/docs/getting-started/introduction' },
        ],
      })
    })

    it('respects explicit frontmatter schemaType, dates, and custom public path', () => {
      const nodes = buildDocSchemaNodes({
        doc: createMockDoc({
          schemaType: 'Article',
          publishedAt: '2026-03-01',
          updatedAt: '2026-03-10',
        }),
        path: '/guide/getting-started/introduction',
        breadcrumbs: [
          { title: 'Guide', to: '/guide' },
        ],
      })

      expect(nodes[0]).toMatchObject({
        '@type': 'Article',
        'datePublished': '2026-03-01',
        'dateModified': '2026-03-10',
      })
      expect(nodes[1]).toMatchObject({
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { name: 'Guide', item: '/guide' },
          { name: 'Introduction', item: '/guide/getting-started/introduction' },
        ],
      })
    })
  })
})
