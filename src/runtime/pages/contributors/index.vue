<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import {
  usePublicCollection,
  useSeoMeta,
  useContentPageSchema,
  useNuxtifyConfig,
  titleCase,
  useAsyncData,
  getContentItemLink,
  normalizePrefix,
} from '#imports'

const nuxtifyConfig = useNuxtifyConfig()
const contributorsPrefix = normalizePrefix(nuxtifyConfig.content?.contributors?.routePrefix, '/contributors')
const { data: contributors } = await useAsyncData('contributors', () => {
  return usePublicCollection('contributors').all()
})

const title = nuxtifyConfig.content?.contributors?.title ?? 'Contributors'
const subtitle = nuxtifyConfig.content?.contributors?.subtitle ?? ''
const description = nuxtifyConfig.content?.contributors?.description ?? ''
useSeoMeta({
  title: subtitle ? `${title} - ${titleCase(subtitle).replace(/\.$/, '')}` : title,
  description,
})
useContentPageSchema(
  { title, path: contributorsPrefix },
  {
    type: 'CollectionPage',
    headline: title,
    description: description || subtitle || undefined,
    breadcrumbs: [{ title: 'Home', to: '/' }],
  },
)
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
          v-for="contributor in contributors"
          :key="contributor.path"
          :link="{ to: getContentItemLink(contributorsPrefix, contributor) }"
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
