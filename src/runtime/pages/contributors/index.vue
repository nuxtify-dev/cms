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
const { data: contributors } = await useAsyncData('contributors', () => {
  return usePublicCollection('contributors').all()
})

const description = appConfig.nuxtify.content.contributors.description
useSeoMeta({
  title: `${appConfig.nuxtify.content.contributors.title} - ${titleCase(
    appConfig.nuxtify.content.contributors.subtitle,
  ).replace(/\.$/, '')}`,
  description,
})
useSchemaOrg([
  defineWebPage({
    '@type': 'CollectionPage',
    'headline': appConfig.nuxtify.content.contributors.title,
    description,
  }),
])
</script>

<template>
  <PageContainer>
    <PageTitle
      :title="appConfig.nuxtify.content.contributors.title"
      :description="appConfig.nuxtify.content.contributors.subtitle"
    />

    <PageBody>
      <PageGrid>
        <PageCard
          v-for="contributor in contributors"
          :key="contributor.path"
          :link="{ to: contributor.path }"
          :title="contributor.name"
          :description="contributor.jobTitle"
          variant="flat"
          class="text-center"
        >
          <template #prepend>
            <div class="d-flex justify-center mt-4 mb-2">
              <NuxtImg
                v-if="contributor.image"
                :src="contributor.image.src"
                :alt="contributor.image.alt"
                width="180"
                height="180"
                format="webp"
                densities="x1 x2"
                class="rounded-circle"
              />
            </div>
          </template>
        </PageCard>
      </PageGrid>
    </PageBody>
  </PageContainer>
</template>
