<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type { BreadcrumbItem } from '../../../types/link'
import {
  useRoute,
  useAsyncData,
  usePublicCollection,
  useSeoMeta,
  useSchemaOrg,
  createError,
  ref,
  getBreadcrumbsSchema,
  defineArticle,
  defineBreadcrumb,
  unslugify,
  useReadingTime,
  useSiteConfig,
  useContributor,
  useAppConfig,
  normalizePrefix,
} from '#imports'

const appConfig = useAppConfig()
const route = useRoute()
const slug = route.params.slug as string

const articlesPrefix = normalizePrefix(appConfig.nuxtify?.content?.articles?.routePrefix, '/articles')
const topicsPrefix = normalizePrefix(appConfig.nuxtify?.content?.topics?.routePrefix, '/topics')
const contributorsPrefix = normalizePrefix(appConfig.nuxtify?.content?.contributors?.routePrefix, '/contributors')
const topicsEnabled = appConfig.nuxtify?.content?.topics?.enabled !== false
const contributorsEnabled = appConfig.nuxtify?.content?.contributors?.enabled !== false

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
    title: appConfig.nuxtify?.content?.articles?.title || 'Articles',
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
useSchemaOrg(article.value.schemaOrg || [
  defineArticle({
    '@type': 'BlogPosting',
    'dateModified': article.value.updatedAt ?? '',
    'datePublished': article.value.publishedAt,
    'headline': article.value.seo?.title ?? '',
    'image': article.value.image?.src ?? '',
    'author':
    author.value
      ? [
          {
            '@type': 'Person',
            'name': author.value.name ?? '',
            ...(contributorsEnabled ? { url: `${useSiteConfig().url}${contributorsPrefix}/${article.value.author}` } : {}),
            'jobTitle': author.value.jobTitle ?? '',
            'honorificSuffix': author.value.honorificSuffix ?? '',
          },
        ]
      : [],
  }),
  defineBreadcrumb({
    itemListElement: getBreadcrumbsSchema(breadcrumbs.value),
  }),
])
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
