<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import {
  usePublicCollection,
  useSeoMeta,
  useSchemaOrg,
  useAppConfig,
  titleCase,
  defineWebPage,
  useAsyncData,
} from '#imports'

const appConfig = useAppConfig()
const { data: notes } = await useAsyncData('notes', () => {
  return usePublicCollection('notes')
    .order('publishedAt', 'DESC')
    .all()
})

const description = appConfig.nuxtify.content.notes?.description ?? ''
const title = appConfig.nuxtify.content.notes?.title ?? 'Notes'
const subtitle = appConfig.nuxtify.content.notes?.subtitle ?? ''

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
      :title="appConfig.nuxtify.content.notes?.title"
      :description="appConfig.nuxtify.content.notes?.subtitle"
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
