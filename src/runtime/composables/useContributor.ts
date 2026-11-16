import { toValue, type MaybeRefOrGetter } from 'vue'
import { normalizePrefix } from '../utils/routes'
import { useNuxtifyConfig } from './nuxtify'
import { usePublicCollection } from './usePublicCollection'
import { useAsyncData } from '#imports'

const fetchContributor = async (authorSlug: string | undefined, contributorsPrefix: string) => {
  if (!authorSlug) return null

  const direct = await usePublicCollection('contributors')
    .path(`${contributorsPrefix}/${authorSlug}`)
    .first()
  if (direct) return direct

  return await usePublicCollection('contributors')
    .where('stem', 'LIKE', `%/${authorSlug}`)
    .first()
}

export const useContributor = (slug: MaybeRefOrGetter<string | undefined>) => {
  const nuxtifyConfig = useNuxtifyConfig()
  const contributorsPrefix = normalizePrefix(nuxtifyConfig.content?.contributors?.routePrefix, '/contributors')
  const authorSlug = toValue(slug)

  return useAsyncData(
    `contributor-${authorSlug || 'none'}`,
    () => fetchContributor(authorSlug, contributorsPrefix),
    {
      immediate: Boolean(authorSlug),
    },
  )
}
