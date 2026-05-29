<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import {
  usePublicCollection,
  useSeoMeta,
  useSchemaOrg,
  useAppConfig,
  titleCase,
  defineWebPage,
  useAsyncData,
} from '#imports'

const appConfig = useAppConfig()
const { data: articles } = await useAsyncData('articles', () => {
  return usePublicCollection('articles')
    .order('publishedAt', 'DESC')
    .all()
})

const description = appConfig.nuxtify.content.articles.description
useSeoMeta({
  title: `${appConfig.nuxtify.content.articles.title} - ${titleCase(
    appConfig.nuxtify.content.articles.subtitle,
  ).replace(/\.$/, '')}`,
  description,
})
useSchemaOrg([
  defineWebPage({
    '@type': 'CollectionPage',
    'headline': appConfig.nuxtify.content.articles.title,
    description,
  }),
])
</script>

<template>
  <PageContainer>
    <PageTitle
      :title="appConfig.nuxtify.content.articles.title"
      :description="appConfig.nuxtify.content.articles.subtitle"
    />

    <PageBody>
      <ArticleCard
        v-for="article in articles"
        :key="article.path"
        :article
        class="mt-12"
      />
    </PageBody>
  </PageContainer>
</template>
