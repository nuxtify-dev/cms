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
  getContentItemLink,
  normalizePrefix,
} from '#imports'

const nuxtifyConfig = useNuxtifyConfig()
const topicsPrefix = normalizePrefix(nuxtifyConfig.content?.topics?.routePrefix, '/topics')
const { data: topics } = await useAsyncData('topics', () => {
  return usePublicCollection('topics').all()
})

const title = nuxtifyConfig.content?.topics?.title ?? 'Topics'
const subtitle = nuxtifyConfig.content?.topics?.subtitle ?? ''
const description = nuxtifyConfig.content?.topics?.description ?? ''
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
  <PageContainer>
    <PageTitle
      :title
      :description="subtitle"
    />

    <PageBody>
      <PageGrid>
        <PageCard
          v-for="topic in topics"
          :key="topic.path"
          :link="{ to: getContentItemLink(topicsPrefix, topic) }"
          :title="topic.title"
          :description="topic.description"
        />
      </PageGrid>
    </PageBody>
  </PageContainer>
</template>
