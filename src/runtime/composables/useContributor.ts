import type { MaybeRefOrGetter } from 'vue'
import {
  usePublicCollection,
  useAsyncData,
  toValue,
} from '#imports'

const fetchContributor = (authorSlug?: string) => {
  if (!authorSlug) return Promise.resolve(null)
  return usePublicCollection('contributors').path(`/contributors/${authorSlug}`).first()
}

export const useContributor = (slug: MaybeRefOrGetter<string | undefined>) => {
  const authorSlug = toValue(slug)
  return useAsyncData(
    `contributor-${authorSlug || 'none'}`,
    () => fetchContributor(authorSlug),
    {
      immediate: Boolean(authorSlug),
    },
  )
}
