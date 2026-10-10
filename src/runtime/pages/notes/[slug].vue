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
} from '#imports'

const route = useRoute()

// Fetch note
const { data: note } = await useAsyncData(`note-${route.path}`, () => {
  return usePublicCollection('notes').path(route.path).first()
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
    title: 'Notes',
    disabled: false,
    to: '/notes',
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
            'url': `${siteConfig.url}/contributors/${note.value.author}`,
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
