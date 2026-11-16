<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import {
  usePublicCollection,
  useSeoMeta,
  useContentPageSchema,
  useNuxtifyConfig,
  normalizePrefix,
  titleCase,
  useAsyncData,
} from '#imports'

const nuxtifyConfig = useNuxtifyConfig()
const notesPrefix = normalizePrefix(nuxtifyConfig.content?.notes?.routePrefix, '/notes')
const { data: notes } = await useAsyncData('notes', () => {
  return usePublicCollection('notes')
    .order('publishedAt', 'DESC')
    .all()
})

const description = nuxtifyConfig.content?.notes?.description ?? ''
const title = nuxtifyConfig.content?.notes?.title ?? 'Notes'
const subtitle = nuxtifyConfig.content?.notes?.subtitle ?? ''

useSeoMeta({
  title: subtitle ? `${title} - ${titleCase(subtitle).replace(/\.$/, '')}` : title,
  description: description || subtitle || undefined,
})

useContentPageSchema(
  { title, path: notesPrefix },
  {
    type: 'CollectionPage',
    headline: title,
    description: description || subtitle || undefined,
    breadcrumbs: [{ title: 'Home', to: '/' }],
  },
)
</script>

<template>
  <PageContainer class="mt-4">
    <PageTitle
      :title="nuxtifyConfig.content?.notes?.title"
      :description="nuxtifyConfig.content?.notes?.subtitle"
      align="center"
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
