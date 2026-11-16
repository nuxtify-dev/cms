import { describe, expect, it } from 'vitest'
import { createSiteConfigStack } from 'site-config-stack'
import {
  buildBrandSiteConfigFallback,
  getBreadcrumbsSchema,
  mergeSchemaOrgNodes,
  normalizeSchemaImage,
  stripMarkdown,
} from '../../src/runtime/utils/seo'
import { articleSchemaTypeEnum } from '../../src/runtime/utils/contentSchemas'

describe('seo utilities', () => {
  describe('getBreadcrumbsSchema', () => {
    it('returns an empty array when fewer than two valid items exist', () => {
      expect(getBreadcrumbsSchema([])).toEqual([])
      expect(getBreadcrumbsSchema([{ title: 'Home', to: '/' }])).toEqual([])
      expect(getBreadcrumbsSchema([], { title: 'Home', to: '/' })).toEqual([])
    })

    it('appends the current item and keeps string or object route paths', () => {
      const items = getBreadcrumbsSchema(
        [
          { title: 'Home', to: '/' },
          { title: 'Topics', to: { path: '/topics' } },
        ],
        { title: 'Nuxt', to: '/topics/nuxt' },
      )

      expect(items).toEqual([
        { name: 'Home', item: '/' },
        { name: 'Topics', item: '/topics' },
        { name: 'Nuxt', item: '/topics/nuxt' },
      ])
    })

    it('drops non-final items without a URL while preserving the final item', () => {
      const items = getBreadcrumbsSchema(
        [
          { title: 'Articles', to: '/articles' },
          { title: 'Disabled Topic', disabled: true },
        ],
        { title: 'Deep Dive' },
      )

      expect(items).toEqual([
        { name: 'Articles', item: '/articles' },
        { name: 'Deep Dive' },
      ])
    })
  })

  describe('stripMarkdown', () => {
    it('strips common markdown syntax while preserving readable text', () => {
      const input = '## Heading\n\nRead **[the docs](https://nuxt.com)** and `code` with _emphasis_ and ![alt text](/img.png).'
      expect(stripMarkdown(input)).toBe('Heading Read the docs and code with emphasis and alt text.')
    })

    it('preserves underscores inside identifiers', () => {
      expect(stripMarkdown('Use `my_helper_fn` or my_variable_name.')).toBe('Use my_helper_fn or my_variable_name.')
    })

    it('returns an empty string for empty input', () => {
      expect(stripMarkdown(undefined)).toBe('')
      expect(stripMarkdown('')).toBe('')
    })
  })

  describe('normalizeSchemaImage', () => {
    it('prepends a leading slash to relative local asset paths', () => {
      expect(normalizeSchemaImage('content/contributors/sparky.jpg')).toBe('/content/contributors/sparky.jpg')
      expect(normalizeSchemaImage('./images/hero.png')).toBe('/images/hero.png')
    })

    it('preserves root-relative and absolute URLs', () => {
      expect(normalizeSchemaImage('/images/hero.png')).toBe('/images/hero.png')
      expect(normalizeSchemaImage('https://example.com/hero.png')).toBe('https://example.com/hero.png')
      expect(normalizeSchemaImage('//cdn.example.com/hero.png')).toBe('//cdn.example.com/hero.png')
    })

    it('returns undefined for empty input', () => {
      expect(normalizeSchemaImage(undefined)).toBeUndefined()
      expect(normalizeSchemaImage('   ')).toBeUndefined()
    })
  })

  describe('buildBrandSiteConfigFallback', () => {
    it('returns undefined when brand fields are empty', () => {
      expect(buildBrandSiteConfigFallback(undefined)).toBeUndefined()
      expect(buildBrandSiteConfigFallback({ name: '', domain: '', tagline: '' })).toBeUndefined()
    })

    it('maps brand options into a low-priority siteConfig fallback without overriding explicit config', () => {
      const fallback = buildBrandSiteConfigFallback({
        name: 'Nuxtify',
        domain: 'nuxtify.dev',
        tagline: 'Modular Nuxt templates',
        logo: { lightUrl: 'images/logo.svg' },
      })

      expect(fallback).toEqual({
        _priority: -10,
        name: 'Nuxtify',
        description: 'Modular Nuxt templates',
        url: 'https://nuxtify.dev',
        identity: {
          type: 'Organization',
          logo: '/images/logo.svg',
        },
      })

      const stack = createSiteConfigStack()
      stack.push(fallback!)
      stack.push({ _priority: -3, name: 'Explicit Site Name', url: 'https://custom.example' })

      expect(stack.get()).toMatchObject({
        name: 'Explicit Site Name',
        url: 'https://custom.example',
        description: 'Modular Nuxt templates',
        identity: {
          type: 'Organization',
          logo: '/images/logo.svg',
        },
      })
    })
  })

  describe('mergeSchemaOrgNodes', () => {
    it('normalizes single object overrides and appends missing breadcrumbs', () => {
      const merged = mergeSchemaOrgNodes(
        { '@type': 'AboutPage', 'name': 'About' },
        [{ '@type': 'WebPage' }],
        { '@type': 'BreadcrumbList', 'itemListElement': [] },
      )

      expect(merged).toEqual([
        { '@type': 'AboutPage', 'name': 'About' },
        { '@type': 'BreadcrumbList', 'itemListElement': [] },
      ])
    })

    it('does not duplicate BreadcrumbList when the override already supplies one', () => {
      const merged = mergeSchemaOrgNodes(
        [
          { '@type': 'WebPage' },
          { '@type': 'BreadcrumbList', 'itemListElement': [{ name: 'Custom' }] },
        ],
        [],
        { '@type': 'BreadcrumbList', 'itemListElement': [{ name: 'Default' }] },
      )

      expect(merged).toHaveLength(2)
      expect(merged[1]).toEqual({ '@type': 'BreadcrumbList', 'itemListElement': [{ name: 'Custom' }] })
    })
  })

  describe('articleSchemaTypeEnum', () => {
    it('accepts valid Article subtype literals and rejects unsupported types', () => {
      expect(articleSchemaTypeEnum.parse('Article')).toBe('Article')
      expect(articleSchemaTypeEnum.parse('TechArticle')).toBe('TechArticle')
      expect(() => articleSchemaTypeEnum.parse('Product')).toThrow()
    })
  })
})
