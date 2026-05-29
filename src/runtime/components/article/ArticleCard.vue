<script setup lang="ts">
import type { Article } from '../../../types/content'
import {
  useRoute,
  computed,
  useAsyncData,
  usePublicCollection,
  unslugify,
} from '#imports'

// PROPS
const props = defineProps<{
  article: Article
}>()

// ROUTE
const route = useRoute()

const { data: author } = await useAsyncData(`author-${props.article.author}`, () => {
  return usePublicCollection('contributors').path(`/contributors/${props.article.author}`).first()
})

// STATE - LOCAL
const primaryTopic = computed(() => props.article.topics?.[0] ?? '')
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
        :to="`/topics/${primaryTopic}`"
        class="nf-article-primary-topic"
      >
        {{ unslugify(primaryTopic) }}
      </NuxtLink>
    </div>

    <!-- Title -->
    <h2 class="text-h5 text-secondary font-weight-bold">
      <NuxtLink :to="`${article.path}`">
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

    <!-- Author Byline -->
    <AuthorByline
      v-if="author"
      :author
      :timestamp="article.publishedAt ?? ''"
      hide-timestamp-text
      class="mt-2"
    />
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
