<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import {
  useRoute,
  useAsyncData,
  usePublicCollection,
  useSeoMeta,
  useContentPageSchema,
  useNuxtifyConfig,
  normalizePrefix,
  unslugify,
  titleCase,
} from '#imports'

const nuxtifyConfig = useNuxtifyConfig()
const route = useRoute()
const slug = route.params.slug as string
const tag = unslugify(slug)

const { data: notes } = await useAsyncData(`notes-tagged-${slug}`, () => {
  return usePublicCollection('notes')
    .where('tags', 'LIKE', `%"${tag}"%`)
    .order('publishedAt', 'DESC')
    .all()
})

const title = `Posts about ${titleCase(tag)}`
const description = 'Discover these and many more posts on hundreds of topics.'
useSeoMeta({
  title,
  description,
})

const notesEnabled = nuxtifyConfig.content?.notes?.enabled !== false
const notesPrefix = normalizePrefix(nuxtifyConfig.content?.notes?.routePrefix, '/notes')
const notesTitle = nuxtifyConfig.content?.notes?.title ?? 'Notes'
useContentPageSchema(
  {
    title: titleCase(tag),
    path: route.path,
    seo: {
      title,
      description,
    },
  },
  {
    type: 'CollectionPage',
    headline: title,
    breadcrumbTitle: titleCase(tag),
    breadcrumbs: [
      { title: 'Home', to: '/' },
      ...(notesEnabled ? [{ title: notesTitle, to: notesPrefix }] : []),
    ],
  },
)
</script>

<template>
  <PageContainer>
    <PageTitle
      :title="title"
      description="Discover these and many more posts on hundreds of topics."
    />

    <PageBody>
      <v-row
        v-if="notes?.length"
        justify="center"
      >
        <v-col
          cols="12"
          sm="10"
          lg="12"
          xl="10"
        >
          <NoteCard
            v-for="note in notes"
            :key="note.path"
            :note
          />
        </v-col>
      </v-row>
    </PageBody>
  </PageContainer>
</template>
