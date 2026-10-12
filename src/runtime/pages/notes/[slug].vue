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
  useSiteConfig,
  useContributor,
  useAppConfig,
  normalizePrefix,
} from '#imports'

const appConfig = useAppConfig()
const route = useRoute()
const slug = route.params.slug as string
const notesPrefix = normalizePrefix(appConfig.nuxtify?.content?.notes?.routePrefix, '/notes')
const contributorsPrefix = normalizePrefix(appConfig.nuxtify?.content?.contributors?.routePrefix, '/contributors')
const contributorsEnabled = appConfig.nuxtify?.content?.contributors?.enabled !== false

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
    title: appConfig.nuxtify?.content?.notes?.title || 'Notes',
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
const siteConfig = useSiteConfig()
useSchemaOrg(note.value.schemaOrg || [
  defineArticle({
    '@type': 'BlogPosting',
    'dateModified': note.value.updatedAt ?? '',
    'datePublished': note.value.publishedAt,
    'headline': seoTitle,
    'image': note.value.image?.src ?? '',
    'author': author.value
      ? [
          {
            '@type': 'Person',
            'name': author.value.name,
            ...(contributorsEnabled ? { url: `${siteConfig.url}${contributorsPrefix}/${note.value.author}` } : {}),
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
  <PageContainer>
    <v-row
      justify="center"
      class="my-4"
    >
      <v-col
        cols="12"
        sm="10"
        lg="8"
        xl="6"
      >
        <PageBreadcrumbs :breadcrumbs="breadcrumbs" />

        <NoteCard
          v-if="note"
          :note
        />
      </v-col>
    </v-row>
  </PageContainer>
</template>
