<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type { BreadcrumbItem } from '../../../types/link'
import {
  useRoute,
  useAsyncData,
  usePublicCollection,
  useSeoMeta,
  createError,
  ref,
  titleCase,
  unslugify,
  useReadingTime,
  useContributor,
  useNuxtifyConfig,
  useArticleSchema,
  normalizePrefix,
} from '#imports'

const nuxtifyConfig = useNuxtifyConfig()
const route = useRoute()
const slug = route.params.slug as string

const articlesPrefix = normalizePrefix(nuxtifyConfig.content?.articles?.routePrefix, '/articles')
const topicsPrefix = normalizePrefix(nuxtifyConfig.content?.topics?.routePrefix, '/topics')
const topicsEnabled = nuxtifyConfig.content?.topics?.enabled !== false

const { data: article } = await useAsyncData(`article-${route.path}`, async () => {
  const direct = await usePublicCollection('articles').path(route.path).first()
  if (direct) return direct

  return await usePublicCollection('articles')
    .where('stem', 'LIKE', `%/${slug}`)
    .first()
})
if (!article.value) {
  throw createError({ status: 404, statusText: 'Article not found', fatal: import.meta.client })
}

const { data: author } = await useContributor(article.value.author)

const readTime = useReadingTime(article)
const breadcrumbs = ref<BreadcrumbItem[]>([
  {
    title: nuxtifyConfig.content?.articles?.title || 'Articles',
    to: articlesPrefix,
  },
])

if (article.value.topics?.length && article.value.topics[0]) {
  breadcrumbs.value.push({
    title: unslugify(article.value.topics[0]),
    to: topicsEnabled ? `${topicsPrefix}/${article.value.topics[0]}` : undefined,
    disabled: !topicsEnabled,
  })
}

// SEO
// if (article.value?.ogImage?.component) {
//   defineOgImage({ component: article.value.ogImage.component, ...article.value.ogImage.props })
// }
useSeoMeta(article.value.seo || {})
useArticleSchema({
  doc: article,
  author,
  authorSlug: article.value.author,
  schemaType: nuxtifyConfig.content?.articles?.schemaType,
  breadcrumbs,
  section: article.value.topics?.[0] ? titleCase(unslugify(article.value.topics[0])) : undefined,
  keywords: article.value.topics?.map(topic => titleCase(unslugify(topic))),
})
</script>

<template>
  <PageContainer v-if="article">
    <ArticleTitle
      :title="article.title"
      :description="article.description"
    >
      <template #overline>
        <PageBreadcrumbs :breadcrumbs />
      </template>

      <div
        v-if="author || article.publishedAt || article.updatedAt"
        class="d-flex justify-space-between align-center mt-4"
      >
        <AuthorByline
          v-if="author"
          :author
        />

        <ArticleDate
          v-if="article.updatedAt || article.publishedAt"
          :timestamp="article.updatedAt || article.publishedAt"
          :updated="!!article.updatedAt"
          :read-time="readTime"
          :class="{ 'ms-auto': !author }"
        />
      </div>
    </ArticleTitle>

    <PageBody>
      <PageContentStyles>
        <ContentRenderer :value="article" />
      </PageContentStyles>
    </PageBody>
  </PageContainer>
</template>
