<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import {
  usePublicCollection,
  useSeoMeta,
  useContentPageSchema,
  useNuxtifyConfig,
  normalizePrefix,
  titleCase,
  useAsyncData,
} from '#imports'

const nuxtifyConfig = useNuxtifyConfig()
const articlesPrefix = normalizePrefix(nuxtifyConfig.content?.articles?.routePrefix, '/articles')
const { data: articles } = await useAsyncData('articles', () => {
  return usePublicCollection('articles')
    .order('publishedAt', 'DESC')
    .all()
})

const title = nuxtifyConfig.content?.articles?.title ?? 'Articles'
const subtitle = nuxtifyConfig.content?.articles?.subtitle ?? ''
const description = nuxtifyConfig.content?.articles?.description ?? ''
useSeoMeta({
  title: subtitle ? `${title} - ${titleCase(subtitle).replace(/\.$/, '')}` : title,
  description: description || subtitle || undefined,
})
useContentPageSchema(
  { title, path: articlesPrefix },
  {
    type: 'CollectionPage',
    headline: title,
    description: description || subtitle || undefined,
    breadcrumbs: [{ title: 'Home', to: '/' }],
  },
)
</script>

<template>
  <PageContainer>
    <PageTitle
      :title
      :description="subtitle"
    />

    <PageBody>
      <ArticleCard
        v-for="(article, index) in articles"
        :key="article.path"
        :article
        :class="{ 'mt-12': index > 0 }"
      />
    </PageBody>
  </PageContainer>
</template>
