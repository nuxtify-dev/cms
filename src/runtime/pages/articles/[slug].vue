<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
import type { BreadcrumbItem } from '../../../types/link'
import { isTocEnabled } from '../../utils/toc/rail'
import {
  useRoute,
  useAsyncData,
  usePublicCollection,
  useSeoMeta,
  createError,
  titleCase,
  unslugify,
  useReadingTime,
  useContributor,
  useNuxtifyConfig,
  useArticleSchema,
  buildArticleSeoMeta,
  normalizePrefix,
} from '#imports'

const nuxtifyConfig = useNuxtifyConfig()
const route = useRoute()
const { mdAndDown } = useDisplay()
const slug = route.params.slug as string

const articlesConfig = computed(() => nuxtifyConfig.content?.articles)
const articlesPrefix = normalizePrefix(articlesConfig.value?.routePrefix, '/articles')
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
    title: articlesConfig.value?.title || 'Articles',
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

const tocTitle = computed(() => articlesConfig.value?.toc?.title || 'On this page')
const tocLinks = computed(() => article.value?.body?.toc?.links || [])
const tocEnabled = computed(() => isTocEnabled({
  configEnabled: articlesConfig.value?.toc?.enabled,
  pageToc: article.value?.toc,
  links: tocLinks.value,
  minHeadings: 2,
}))
const hasDesktopToc = computed(() => !mdAndDown.value && tocEnabled.value)
const hasMobileToc = computed(() => mdAndDown.value && tocEnabled.value)

const articleKeywords = article.value.topics?.map(topic => titleCase(unslugify(topic)))

// SEO
// if (article.value?.ogImage?.component) {
//   defineOgImage({ component: article.value.ogImage.component, ...article.value.ogImage.props })
// }
useSeoMeta(buildArticleSeoMeta(article.value, { tags: articleKeywords }))
useArticleSchema({
  doc: article,
  author,
  authorSlug: article.value.author,
  schemaType: articlesConfig.value?.schemaType,
  breadcrumbs,
  section: article.value.topics?.[0] ? titleCase(unslugify(article.value.topics[0])) : undefined,
  keywords: articleKeywords,
})
</script>

<template>
  <div
    v-if="article"
    :class="['article-container', { 'article-container--with-toc': hasDesktopToc }]"
  >
    <div :class="['article-grid', { 'article-grid--with-toc': hasDesktopToc }]">
      <article class="article-main-col">
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

        <ArticleMobileToc
          v-if="hasMobileToc"
          :links="tocLinks"
          :title="tocTitle"
          :current-path="route.path"
        />

        <PageContentStyles>
          <ContentRenderer :value="article" />
        </PageContentStyles>
      </article>

      <aside
        v-if="hasDesktopToc"
        class="article-toc-col"
      >
        <PageToc
          :links="tocLinks"
          :title="tocTitle"
        />
      </aside>
    </div>
  </div>
</template>

<style scoped>
.article-container {
  max-width: 812px;
  margin: 0 auto;
  padding: 24px 16px 64px;
}

.article-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 32px;
  align-items: start;
}

.article-main-col {
  min-width: 0;
}

.article-toc-col {
  position: sticky;
  top: calc(var(--v-layout-top, 64px) + 24px);
  max-height: calc(100vh - var(--v-layout-top, 64px) - 40px);
  overflow-y: auto;
}

@media (min-width: 960px) {
  .article-container {
    padding: 32px 16px 64px;
  }
}

@media (min-width: 1280px) {
  .article-container--with-toc {
    max-width: 1072px;
  }

  .article-grid--with-toc {
    grid-template-columns: minmax(0, 1fr) 220px;
    gap: 40px;
  }
}
</style>
