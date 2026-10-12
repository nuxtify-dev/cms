<script setup lang="ts">
import type { Article } from '../../../types/content'
import {
  useRoute,
  computed,
  useContributor,
  unslugify,
  useAppConfig,
  getContentItemLink,
  normalizePrefix,
} from '#imports'

// PROPS
const props = defineProps<{
  article: Article
}>()

// ROUTE & CONFIG
const route = useRoute()
const appConfig = useAppConfig()
const articlesPrefix = normalizePrefix(appConfig.nuxtify?.content?.articles?.routePrefix, '/articles')
const topicsPrefix = normalizePrefix(appConfig.nuxtify?.content?.topics?.routePrefix, '/topics')
const topicsEnabled = computed(() => appConfig.nuxtify?.content?.topics?.enabled !== false)

const { data: author } = await useContributor(props.article.author)

// STATE - LOCAL
const primaryTopic = computed(() => props.article.topics?.[0] ?? '')
const articleLink = computed(() => getContentItemLink(articlesPrefix, props.article))
</script>

<template>
  <article>
    <!-- Primary Topic -->
    <div
      v-if="
        article.topics?.length
          && route.params.slug !== primaryTopic
      "
      class="text-overline"
    >
      <NuxtLink
        v-if="topicsEnabled"
        :to="`${topicsPrefix}/${primaryTopic}`"
        class="nf-article-primary-topic"
      >
        {{ unslugify(primaryTopic) }}
      </NuxtLink>
      <span
        v-else
        class="nf-article-primary-topic"
      >
        {{ unslugify(primaryTopic) }}
      </span>
    </div>

    <!-- Title -->
    <h2 class="text-h5 text-secondary font-weight-bold">
      <NuxtLink :to="articleLink">
        {{ article.title }}
      </NuxtLink>
    </h2>

    <!-- Summary -->
    <div
      v-if="article.summary"
      class="text-subtitle-1 text-medium-emphasis mt-2"
    >
      {{ article.summary }}
    </div>

    <!-- Author Byline & Date -->
    <div
      v-if="author || article.publishedAt"
      class="d-flex justify-space-between align-center mt-2"
    >
      <AuthorByline
        v-if="author"
        :author
      />

      <ArticleDate
        v-if="article.publishedAt"
        :timestamp="article.publishedAt"
        hide-timestamp-text
        :class="{ 'ms-auto': !author }"
      />
    </div>
  </article>
</template>

<style scoped>
a {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
}
a:hover {
  color: rgb(var(--v-theme-secondary));
}

.nf-article-primary-topic {
  color: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));
}
.nf-article-primary-topic:hover {
  color: rgb(var(--v-theme-secondary));
}
</style>
