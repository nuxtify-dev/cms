<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import {
  usePublicCollection,
  useSeoMeta,
  useSchemaOrg,
  useNuxtifyConfig,
  titleCase,
  defineWebPage,
  useAsyncData,
} from '#imports'

const nuxtifyConfig = useNuxtifyConfig()
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
  description,
})

useSchemaOrg([
  defineWebPage({
    '@type': 'CollectionPage',
    'headline': title,
    description,
  }),
])
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
