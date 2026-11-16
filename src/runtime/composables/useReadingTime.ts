import type { Article } from '../../types/content'
import { countDocumentWords } from '../utils/seo'
import {
  computed,
  toValue,
  useNuxtifyConfig,
  type ComputedRef,
  type MaybeRefOrGetter,
} from '#imports'

export function useReadingTime(
  article: MaybeRefOrGetter<Article | null | undefined>,
): ComputedRef<number | string | undefined> {
  const nuxtifyConfig = useNuxtifyConfig()

  return computed(() => {
    const config = nuxtifyConfig.content?.articles?.readTime
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

    const words = countDocumentWords(currentArticle.body)
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
