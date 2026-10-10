import { describe, expect, it } from 'vitest'
import {
  normalizePrefix,
  extractSlug,
  getContentItemLink,
} from '../../src/runtime/utils/routes'

describe('routes utilities', () => {
  describe('normalizePrefix', () => {
    it('returns fallback when prefix is undefined, null, or empty', () => {
      expect(normalizePrefix(undefined, '/articles')).toBe('/articles')
      expect(normalizePrefix('', '/notes')).toBe('/notes')
      expect(normalizePrefix('   ', '/topics')).toBe('/topics')
    })

    it('ensures a leading slash', () => {
      expect(normalizePrefix('essays', '/articles')).toBe('/essays')
      expect(normalizePrefix('blog/posts', '/articles')).toBe('/blog/posts')
    })

    it('strips trailing slashes', () => {
      expect(normalizePrefix('/essays/', '/articles')).toBe('/essays')
      expect(normalizePrefix('essays///', '/articles')).toBe('/essays')
      expect(normalizePrefix('/journal//', '/notes')).toBe('/journal')
    })

    it('handles clean prefixes unchanged', () => {
      expect(normalizePrefix('/essays', '/articles')).toBe('/essays')
      expect(normalizePrefix('/team', '/contributors')).toBe('/team')
    })
  })

  describe('extractSlug', () => {
    it('extracts slug from string paths', () => {
      expect(extractSlug('/articles/my-first-post')).toBe('my-first-post')
      expect(extractSlug('articles/my-first-post')).toBe('my-first-post')
      expect(extractSlug('my-first-post')).toBe('my-first-post')
    })

    it('extracts slug from item with stem or path', () => {
      expect(extractSlug({ stem: 'articles/first', path: '/articles/first' })).toBe('first')
      expect(extractSlug({ path: '/notes/second' })).toBe('second')
      expect(extractSlug({ stem: 'topics/vue' })).toBe('vue')
    })

    it('returns empty string for empty inputs', () => {
      expect(extractSlug(undefined)).toBe('')
      expect(extractSlug({})).toBe('')
      expect(extractSlug('')).toBe('')
    })
  })

  describe('getContentItemLink', () => {
    it('creates permalink from prefix and item', () => {
      expect(getContentItemLink('/essays', { stem: 'articles/deep-dive' })).toBe('/essays/deep-dive')
      expect(getContentItemLink('essays', { path: '/articles/deep-dive' })).toBe('/essays/deep-dive')
      expect(getContentItemLink('/journal/', 'note-1')).toBe('/journal/note-1')
    })

    it('falls back to prefix if no slug is extractable', () => {
      expect(getContentItemLink('/essays', '')).toBe('/essays')
      expect(getContentItemLink('essays', undefined)).toBe('/essays')
    })
  })
})
