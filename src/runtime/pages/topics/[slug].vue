<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import {
  useRoute,
  useAsyncData,
  usePublicCollection,
  useSeoMeta,
  useSchemaOrg,
  createError,
} from '#imports'

const route = useRoute()
const slug = route.params.slug as string

const { data: topic } = await useAsyncData(`topic-${route.path}`, () => {
  return usePublicCollection('topics').path(route.path).first()
})
if (!topic.value) {
  throw createError({ status: 404, statusText: 'Topic not found', fatal: import.meta.client })
}

const { data: articles } = await useAsyncData(`articles-in-${slug}`, () => {
  return usePublicCollection('articles')
    .where('topics', 'LIKE', `%${slug}%`)
    .order('publishedAt', 'DESC')
    .all()
})

// SEO
// if (topic.value?.ogImage?.component) {
//   defineOgImage({ component: topic.value.ogImage.component, ...topic.value.ogImage.props })
// }
useSeoMeta(topic.value.seo || {})
useSchemaOrg(topic.value.schemaOrg || [])
</script>

<template>
  <PageContainer v-if="topic">
    <PageTitle
      :title="topic.title"
      :description="topic.description"
    />

    <PageBody>
      <ContentRenderer
        :value="topic"
        class="mb-12"
      />

      <template v-if="articles?.length">
        <v-divider class="mb-12" />
        <h2 class="text-h4 font-weight-bold mb-6">
          Articles in {{ topic.title }}
        </h2>

        <ArticleCard
          v-for="article in articles"
          :key="article.path"
          :article
          class="mt-12"
        />
      </template>
    </PageBody>
  </PageContainer>
</template>
