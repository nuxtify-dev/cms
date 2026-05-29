<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import {
  usePublicCollection,
  useSeoMeta,
  useSchemaOrg,
  defineWebPage,
  useAsyncData,
  useRoute,
  createError,
  honoraryName,
  definePerson,
  slugify,
  useSiteConfig,
} from '#imports'

const route = useRoute()
const slug = route.params.slug as string

const { data: contributor } = await useAsyncData(`contributor-${route.path}`, () => {
  return usePublicCollection('contributors').path(route.path).first()
})

if (!contributor.value) {
  throw createError({ status: 404, statusText: 'Contributor not found', fatal: import.meta.client })
}

const { data: articles } = await useAsyncData(`articles-by-${slug}`, () => {
  return usePublicCollection('articles')
    .where('author', '=', slug)
    .order('publishedAt', 'DESC')
    .all()
})

// SEO
// if (contributor.value?.ogImage?.component) {
//   defineOgImage({ component: contributor.value.ogImage.component, ...contributor.value.ogImage.props })
// }
useSeoMeta({
  ...contributor.value.seo,
  title: `${honoraryName(
    contributor.value.name,
    contributor.value.honorificSuffix,
  )}${contributor.value.jobTitle ? ` - ${contributor.value.jobTitle}` : ''}`,
})
useSchemaOrg(contributor.value.schemaOrg || [
  defineWebPage({
    '@type': 'ProfilePage',
    'mainEntity': definePerson({
      identifier: slugify(contributor.value.name),
      name: honoraryName(
        contributor.value.name,
        contributor.value.honorificSuffix,
      ),
      description: contributor.value.description,
      image: contributor.value.image?.src ?? '',
      url: `${useSiteConfig().url}/contributors/${
        slugify(contributor.value.name)
      }`,
      jobTitle: contributor.value.jobTitle ?? '',
      honorificSuffix: contributor.value.honorificSuffix ?? '',
      sameAs: Object.values(contributor.value.socials ?? []).filter(Boolean), // Remove false, 0, "", null, undefined, and NaN values
    }),
  }),
])
</script>

<template>
  <PageContainer v-if="contributor">
    <PageTitle
      :title="contributor.name"
      :description="contributor.jobTitle || contributor.description"
      align="center"
    >
      <template
        v-if="contributor.image"
        #overline
      >
        <NuxtImg
          :src="contributor.image.src"
          :alt="contributor.image.alt"
          width="180"
          height="180"
          format="webp"
          densities="x1 x2"
          class="mx-auto rounded-circle mb-2"
        />
      </template>

      <template
        v-if="contributor.socials"
        #actions
      >
        <div>
          <v-btn
            v-if="contributor.socials.website"
            :href="contributor.socials.website"
            aria-label="Visit this contributor's website"
            target="_blank"
            rel="noopener"
            variant="plain"
            icon="mdi-web"
          />
          <v-btn
            v-if="contributor.socials.bluesky"
            :href="contributor.socials.bluesky"
            aria-label="Visit this contributor's Bluesky profile"
            target="_blank"
            rel="noopener"
            variant="plain"
            icon="mdi-bluesky"
          />
          <v-btn
            v-if="contributor.socials.x"
            :href="contributor.socials.x"
            aria-label="Visit this contributor's X profile"
            target="_blank"
            rel="noopener"
            variant="plain"
            icon="mdi-twitter"
          />
          <v-btn
            v-if="contributor.socials.linkedin"
            :href="contributor.socials.linkedin"
            aria-label="Visit this contributor's LinkedIn profile"
            target="_blank"
            rel="noopener"
            variant="plain"
            icon="mdi-linkedin"
          />
          <v-btn
            v-if="contributor.socials.github"
            :href="contributor.socials.github"
            aria-label="Visit this contributor's GitHub profile"
            target="_blank"
            rel="noopener"
            variant="plain"
            icon="mdi-github"
          />
          <v-btn
            v-if="contributor.socials.facebook"
            :href="contributor.socials.facebook"
            aria-label="Visit this contributor's Facebook profile"
            target="_blank"
            rel="noopener"
            variant="plain"
            icon="mdi-facebook"
          />
          <v-btn
            v-if="contributor.socials.instagram"
            :href="contributor.socials.instagram"
            aria-label="Visit this contributor's Instagram profile"
            target="_blank"
            rel="noopener"
            variant="plain"
            icon="mdi-instagram"
          />
          <v-btn
            v-if="contributor.socials.tiktok"
            :href="contributor.socials.tiktok"
            aria-label="Visit this contributor's TikTok profile"
            target="_blank"
            rel="noopener"
            variant="plain"
            icon="mdi-tiktok"
          />
          <v-btn
            v-if="contributor.socials.pinterest"
            :href="contributor.socials.pinterest"
            aria-label="Visit this contributor's Pinterest profile"
            target="_blank"
            rel="noopener"
            variant="plain"
            icon="mdi-pinterest"
          />
          <v-btn
            v-if="contributor.socials.youtube"
            :href="contributor.socials.youtube"
            aria-label="Visit this contributor's YouTube profile"
            target="_blank"
            rel="noopener"
            variant="plain"
            icon="mdi-youtube"
          />
        </div>
      </template>
    </PageTitle>

    <PageBody>
      <PageContentStyles>
        <ContentRenderer
          :value="contributor"
          class="mb-12"
        />
      </PageContentStyles>

      <template v-if="articles?.length">
        <v-divider class="mb-12" />
        <h2 class="font-weight-bold mb-6">
          Articles by {{ contributor.title }}
        </h2>
        <ArticleCard
          v-for="article in articles"
          :key="article.path"
          :article
          class="mt-12"
        />
      </template>

      <ContributorCustomContent />
    </PageBody>
  </PageContainer>
</template>
