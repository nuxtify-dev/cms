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
  useSiteConfig,
} from '#imports'

const route = useRoute()
const { data: article } = await useAsyncData(`article-${route.path}`, () => {
  return usePublicCollection('articles').path(route.path).first()
})
if (!article.value) {
  throw createError({ status: 404, statusText: 'Article not found', fatal: import.meta.client })
}

const { data: author } = await useAsyncData(`article-author-${article.value.author}`, () => {
  return usePublicCollection('contributors').path(`/contributors/${article.value?.author}`).first()
})

const breadcrumbs = ref<BreadcrumbItem[]>([
  {
    title: 'Articles',
    to: '/articles',
  },
])

if (article.value.topics?.length && article.value.topics[0]) {
  breadcrumbs.value.push({
    title: unslugify(article.value.topics[0]),
    to: `/topics/${article.value.topics[0]}`,
    disabled: false,
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
            'url': `${useSiteConfig().url}/contributors/${article.value.author}`,
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

      <AuthorByline
        v-if="author"
        :author
        :timestamp="article.updatedAt || article.publishedAt"
        :updated="!!article.updatedAt"
        class="mt-2"
      />
    </ArticleTitle>

    <PageBody>
      <PageContentStyles>
        <ContentRenderer :value="article" />
      </PageContentStyles>
    </PageBody>
  </PageContainer>
</template>
