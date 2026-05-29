<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import {
  useRoute,
  useAsyncData,
  usePublicCollection,
  useSeoMeta,
  useSchemaOrg,
  createError,
} from '#imports'

const route = useRoute()
const { data: page } = await useAsyncData(`page-${route.path}`, () => {
  return usePublicCollection('pages').path(route.path).first()
})
if (!page.value) {
  throw createError({ status: 404, statusText: 'Page not found', fatal: import.meta.client })
}

// SEO
// if (page.value?.ogImage?.component) {
//   defineOgImage({ component: page.value.ogImage.component, ...page.value.ogImage.props })
// }
useSeoMeta(page.value.seo || {})
useSchemaOrg(page.value.schemaOrg || [])
</script>

<template>
  <PageContainer v-if="page">
    <LazyPageTitle
      v-if="page.showTitle"
      :overline="page.overline"
      :title="page.title"
      :description="page.description"
      :align="page.align || 'center'"
    />

    <PageBody>
      <PageContentStyles>
        <ContentRenderer :value="page" />
      </PageContentStyles>
    </PageBody>
  </PageContainer>
</template>
