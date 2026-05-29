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
const { data: topics } = await useAsyncData('topics', () => {
  return usePublicCollection('topics').all()
})

const description = appConfig.nuxtify.content.topics.description
useSeoMeta({
  title: `${appConfig.nuxtify.content.topics.title} - ${titleCase(
    appConfig.nuxtify.content.topics.subtitle,
  ).replace(/\.$/, '')}`,
  description,
})
useSchemaOrg([
  defineWebPage({
    '@type': 'CollectionPage',
    'headline': appConfig.nuxtify.content.topics.title,
    description,
  }),
])
</script>

<template>
  <PageContainer>
    <PageTitle
      :title="appConfig.nuxtify.content.topics.title"
      :description="appConfig.nuxtify.content.topics.subtitle"
    />

    <PageBody>
      <PageGrid>
        <PageCard
          v-for="topic in topics"
          :key="topic.path"
          :link="{ to: topic.path }"
          :title="topic.title"
          :description="topic.description"
        />
      </PageGrid>
    </PageBody>
  </PageContainer>
</template>
