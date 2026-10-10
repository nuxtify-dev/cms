import type { Article } from '../../types/content'
import {
  computed,
  toValue,
  useAppConfig,
  type ComputedRef,
  type MaybeRefOrGetter,
} from '#imports'

function extractText(node: unknown): string {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)

  if (Array.isArray(node)) {
    // Check if it's a minimark AST node: [tag: string, props: object, ...children]
    if (
      typeof node[0] === 'string'
      && node.length >= 2
      && typeof node[1] === 'object'
      && !Array.isArray(node[1])
    ) {
      return node.slice(2).map(extractText).join(' ')
    }
    return node.map(extractText).join(' ')
  }

  if (typeof node === 'object') {
    const record = node as Record<string, unknown>
    if (typeof record.value === 'string') {
      return record.value
    }
    if (Array.isArray(record.value)) {
      return record.value.map(extractText).join(' ')
    }
    if (Array.isArray(record.children)) {
      return record.children.map(extractText).join(' ')
    }
  }
  return ''
}

function countWords(text: string): number {
  const matches = text.trim().match(/\S+/g)
  return matches ? matches.length : 0
}

export function useReadingTime(
  article: MaybeRefOrGetter<Article | null | undefined>,
): ComputedRef<number | string | undefined> {
  const appConfig = useAppConfig()

  return computed(() => {
    const config = appConfig.nuxtify?.content?.articles?.readTime
    if (config?.enabled === false) {
      return undefined
    }

    const currentArticle = toValue(article)
    if (!currentArticle) {
      return undefined
    }

    if (currentArticle.readTime !== undefined && currentArticle.readTime !== null) {
      return currentArticle.readTime
    }

    if (!currentArticle.body) {
      return undefined
    }

    const text = extractText(currentArticle.body)
    const words = countWords(text)
    if (words === 0) {
      return undefined
    }

    const wpm = config?.wordsPerMinute || 200
    const rawMinutes = words / wpm

    if (rawMinutes < 1) {
      return '< 1'
    }

    return Math.ceil(rawMinutes)
  })
}
