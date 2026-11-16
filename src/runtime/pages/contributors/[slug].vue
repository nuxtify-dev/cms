<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import {
  usePublicCollection,
  useSeoMeta,
  useSchemaOrg,
  defineBreadcrumb,
  defineWebPage,
  useAsyncData,
  useRoute,
  createError,
  getBreadcrumbsSchema,
  honoraryName,
  definePerson,
  mergeSchemaOrgNodes,
  normalizeSchemaImage,
  stripMarkdown,
  useSiteConfig,
  useNuxtifyConfig,
  normalizePrefix,
} from '#imports'

const nuxtifyConfig = useNuxtifyConfig()
const contributorsPrefix = normalizePrefix(nuxtifyConfig.content?.contributors?.routePrefix, '/contributors')
const route = useRoute()
const slug = route.params.slug as string

const { data: contributor } = await useAsyncData(`contributor-${route.path}`, async () => {
  const direct = await usePublicCollection('contributors').path(route.path).first()
  if (direct) return direct

  return await usePublicCollection('contributors')
    .where('stem', 'LIKE', `%/${slug}`)
    .first()
})

if (!contributor.value) {
  throw createError({ status: 404, statusText: 'Contributor not found', fatal: import.meta.client })
}

const articlesEnabled = nuxtifyConfig.content?.articles?.enabled !== false

const { data: articles } = await useAsyncData(`articles-by-${slug}`, async () => {
  if (!articlesEnabled) return []
  return await usePublicCollection('articles')
    .where('author', '=', slug)
    .order('publishedAt', 'DESC')
    .all()
})

// SEO
// if (contributor.value?.ogImage?.component) {
//   defineOgImage({ component: contributor.value.ogImage.component, ...contributor.value.ogImage.props })
// }
const contributorImage = normalizeSchemaImage(contributor.value.image?.src)
const contributorDescription = stripMarkdown(contributor.value.description) || undefined
const fallbackSeoTitle = `${honoraryName(
  contributor.value.name,
  contributor.value.honorificSuffix,
)}${contributor.value.jobTitle ? ` - ${contributor.value.jobTitle}` : ''}`

useSeoMeta({
  ...(contributorImage ? { ogImage: contributorImage } : {}),
  ...contributor.value.seo,
  title: contributor.value.seo?.title || fallbackSeoTitle,
  description: contributor.value.seo?.description || contributorDescription,
})
const siteUrl = (useSiteConfig().url || '').replace(/\/$/, '')
const contributorSocials = (Object.values(contributor.value.socials ?? {}) as (string | undefined)[])
  .filter((value): value is string => Boolean(value?.trim()))
const contributorsTitle = nuxtifyConfig.content?.contributors?.title ?? 'Contributors'
const breadcrumbItems = getBreadcrumbsSchema(
  [
    { title: 'Home', to: '/' },
    { title: contributorsTitle, to: contributorsPrefix },
  ],
  { title: contributor.value.name, to: `${contributorsPrefix}/${slug}` },
)

useSchemaOrg(mergeSchemaOrgNodes(
  contributor.value.schemaOrg,
  [
    defineWebPage({
      '@type': 'ProfilePage',
      'mainEntity': definePerson({
        identifier: slug,
        name: contributor.value.name,
        ...(contributorDescription ? { description: contributorDescription } : {}),
        ...(contributorImage ? { image: contributorImage } : {}),
        url: `${siteUrl}${contributorsPrefix}/${slug}`,
        ...(contributor.value.jobTitle ? { jobTitle: contributor.value.jobTitle } : {}),
        ...(contributor.value.honorificSuffix ? { honorificSuffix: contributor.value.honorificSuffix } : {}),
        ...(contributorSocials.length > 0 ? { sameAs: contributorSocials } : {}),
      }),
    }),
  ],
  breadcrumbItems.length >= 2
    ? defineBreadcrumb({ itemListElement: breadcrumbItems })
    : undefined,
))
</script>

<template>
  <PageContainer v-if="contributor">
    <PageTitle
      :title="contributor.name"
      :description="contributor.jobTitle || contributor.description"
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
        <div class="mt-2">
          <v-btn
            v-if="contributor.socials.website"
            :href="contributor.socials.website"
            aria-label="Visit this contributor's website"
            title="Website"
            target="_blank"
            rel="noopener"
            variant="plain"
            icon="mdi-web"
          />
          <!-- TODO: Replace with correct icon -->
          <v-btn
            v-if="contributor.socials.bluesky"
            :href="contributor.socials.bluesky"
            aria-label="Visit this contributor's Bluesky profile"
            title="Bluesky"
            target="_blank"
            rel="noopener"
            variant="plain"
            icon="mdi-link-variant"
          />
          <!-- TODO: Replace with correct icon -->
          <v-btn
            v-if="contributor.socials.x"
            :href="contributor.socials.x"
            aria-label="Visit this contributor's X/Twitter profile"
            title="X/Twitter"
            target="_blank"
            rel="noopener"
            variant="plain"
            icon="mdi-twitter"
          />
          <v-btn
            v-if="contributor.socials.linkedin"
            :href="contributor.socials.linkedin"
            aria-label="Visit this contributor's LinkedIn profile"
            title="LinkedIn"
            target="_blank"
            rel="noopener"
            variant="plain"
            icon="mdi-linkedin"
          />
          <v-btn
            v-if="contributor.socials.github"
            :href="contributor.socials.github"
            aria-label="Visit this contributor's GitHub profile"
            title="GitHub"
            target="_blank"
            rel="noopener"
            variant="plain"
            icon="mdi-github"
          />
          <v-btn
            v-if="contributor.socials.facebook"
            :href="contributor.socials.facebook"
            aria-label="Visit this contributor's Facebook profile"
            title="Facebook"
            target="_blank"
            rel="noopener"
            variant="plain"
            icon="mdi-facebook"
          />
          <v-btn
            v-if="contributor.socials.instagram"
            :href="contributor.socials.instagram"
            aria-label="Visit this contributor's Instagram profile"
            title="Instagram"
            target="_blank"
            rel="noopener"
            variant="plain"
            icon="mdi-instagram"
          />
          <!-- TODO: Replace with correct icon -->
          <v-btn
            v-if="contributor.socials.tiktok"
            :href="contributor.socials.tiktok"
            aria-label="Visit this contributor's TikTok profile"
            title="TikTok"
            target="_blank"
            rel="noopener"
            variant="plain"
            icon="mdi-link-variant"
          />
          <v-btn
            v-if="contributor.socials.pinterest"
            :href="contributor.socials.pinterest"
            aria-label="Visit this contributor's Pinterest profile"
            title="Pinterest"
            target="_blank"
            rel="noopener"
            variant="plain"
            icon="mdi-pinterest"
          />
          <v-btn
            v-if="contributor.socials.youtube"
            :href="contributor.socials.youtube"
            aria-label="Visit this contributor's YouTube profile"
            title="YouTube"
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
        <ContentRenderer :value="contributor" />
      </PageContentStyles>

      <template v-if="articles?.length">
        <v-divider class="my-12" />
        <h2 class="font-weight-bold mb-6">
          Articles by {{ contributor.name }}
        </h2>
        <ArticleCard
          v-for="(article, index) in articles"
          :key="article.path"
          :article
          :class="{ 'mt-12': index > 0 }"
        />
      </template>

      <ContributorCustomContent />
    </PageBody>
  </PageContainer>
</template>
