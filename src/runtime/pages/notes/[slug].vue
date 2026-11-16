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
  useContributor,
  useNuxtifyConfig,
  useArticleSchema,
  normalizePrefix,
} from '#imports'

const nuxtifyConfig = useNuxtifyConfig()
const route = useRoute()
const slug = route.params.slug as string
const notesPrefix = normalizePrefix(nuxtifyConfig.content?.notes?.routePrefix, '/notes')

// Fetch note
const { data: note } = await useAsyncData(`note-${route.path}`, async () => {
  const direct = await usePublicCollection('notes').path(route.path).first()
  if (direct) return direct

  return await usePublicCollection('notes')
    .where('stem', 'LIKE', `%/${slug}`)
    .first()
})

if (!note.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    fatal: import.meta.client,
  })
}

// Fetch author
const { data: author } = await useContributor(note.value.author)

// Breadcrumbs
const breadcrumbs = ref<BreadcrumbItem[]>([
  {
    title: nuxtifyConfig.content?.notes?.title || 'Notes',
    disabled: false,
    to: notesPrefix,
  },
])

// SEO
const seoTitle = note.value.seo?.title ?? note.value.title ?? 'Note'
useSeoMeta(note.value.seo || {
  title: seoTitle,
  description: note.value.description ?? '',
})

// Schema.org
useArticleSchema({
  doc: note,
  author,
  authorSlug: note.value.author,
  schemaType: nuxtifyConfig.content?.notes?.schemaType,
  breadcrumbs,
  section: note.value.tags?.[0] ? titleCase(unslugify(note.value.tags[0])) : undefined,
  keywords: note.value.tags?.map(tag => titleCase(unslugify(tag))),
})
</script>

<template>
  <PageContainer class="my-8">
    <PageBody>
      <PageBreadcrumbs :breadcrumbs="breadcrumbs" />

      <NoteCard
        v-if="note"
        :note
      />
    </PageBody>
  </PageContainer>
</template>
