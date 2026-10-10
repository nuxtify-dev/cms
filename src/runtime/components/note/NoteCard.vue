<script setup lang="ts">
import type { Note } from '../../../types/content'
import {
  computed,
  useRoute,
  useSiteConfig,
  useAppConfig,
  useContributor,
  slugify,
  titleCase,
  getContentItemLink,
  normalizePrefix,
} from '#imports'

// PROPS
const props = defineProps<{
  note: Note
}>()

// STATE - GLOBAL
const siteConfig = useSiteConfig()
const appConfig = useAppConfig()
const notesPrefix = normalizePrefix(appConfig.nuxtify?.content?.notes?.routePrefix, '/notes')
const noteLink = computed(() => getContentItemLink(notesPrefix, props.note))

// PAGE INFO
const route = useRoute()
const isPermalink = computed(
  () => noteLink.value === route.path || props.note.path === route.path,
)

// Fetch author contributor
const { data: author } = await useContributor(props.note.author)

// STATE - LOCAL
const publishedDate = computed(() => {
  const dateValue = props.note.updatedAt || props.note.publishedAt
  if (!dateValue) return ''
  return new Date(dateValue).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
})
</script>

<template>
  <v-card
    variant="outlined"
    class="mb-4 pa-4"
  >
    <div
      v-if="publishedDate"
      class="float-right text-body-2 ml-4"
    >
      <!-- Published Date -->
      <NuxtLink
        v-if="!isPermalink"
        :to="noteLink"
      >
        {{ publishedDate }}
      </NuxtLink>
      <span v-else>
        {{ publishedDate }}
      </span>
    </div>

    <article>
      <!-- Title -->
      <div
        v-if="note.title"
        class="text-primary text-h5 mb-2"
      >
        <h1
          v-if="isPermalink"
          class="text-h4"
        >
          {{ note.title }}
        </h1>
        <h2
          v-else
          class="text-h5"
        >
          <NuxtLink :to="noteLink">
            {{ note.title }}
          </NuxtLink>
        </h2>
      </div>

      <!-- Content -->
      <ContentRenderer
        :value="note"
        class="text-body-1"
      />
    </article>

    <!-- Tags -->
    <div
      v-if="note.tags?.length"
      class="mt-6"
    >
      <v-chip
        v-for="tag in note.tags"
        :key="tag"
        :to="`/tags/${slugify(tag)}`"
        color="grey-darken-1"
        variant="tonal"
        label
        class="mr-2 mb-2"
      >
        {{ titleCase(tag) }}
      </v-chip>
    </div>

    <!-- Author -->
    <AuthorByline
      v-if="author"
      :author
      class="mt-4"
    />

    <!-- Actions -->
    <v-card-actions
      class="justify-end align-end pa-0 mt-2 mt-sm-0"
      style="min-height: unset"
    >
      <!-- Reply -->
      <v-btn
        v-if="appConfig.nuxtify?.email?.reply"
        :href="`mailto:${appConfig.nuxtify.email.reply}?subject=[REPLY] Thoughts on ${note.title}&body=%0A%0A${siteConfig.url}${noteLink}`"
        prepend-icon="mdi-reply"
        color="primary"
      >
        Reply
      </v-btn>

      <!-- Share -->
      <NoteShareButton
        :path="noteLink"
        :title="note.title ?? ''"
        text="Check out this post:"
      />
    </v-card-actions>
  </v-card>
</template>

<style scoped>
a {
  color: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));
  text-decoration: none;
  cursor: pointer;
}
a:hover {
  color: rgb(var(--v-theme-secondary));
}
</style>
