<script setup lang="ts">
import {
  usePublicCollection,
  useAsyncData,
  unslugify,
} from '#imports'

// FETCH LIVE CONTENT DATA
const { data: articles } = await useAsyncData('demo-cms-articles', () => {
  return usePublicCollection('articles')
    .order('publishedAt', 'DESC')
    .all()
})

const { data: contributors } = await useAsyncData('demo-cms-contributors', () => {
  return usePublicCollection('contributors').all()
})

const { data: topics } = await useAsyncData('demo-cms-topics', () => {
  return usePublicCollection('topics').all()
})

// MOCK CODE EXAMPLES FOR DEVELOPERS
const queryCodeExample = `// Query safe public collection (filters out drafts in production)
const { data: articles } = await useAsyncData('articles', () => {
  return usePublicCollection('articles')
    .order('publishedAt', 'DESC')
    .all()
})`

const configSchemaExample = `// content.config.ts - Automatic schema configuration
export default defineContentConfig({
  collections: {
    articles: defineCollection({
      type: 'page',
      source: 'articles/*.md',
      schema: articleSchema,
    }),
    contributors: defineCollection({
      type: 'page',
      source: 'contributors/*.md',
      schema: contributorSchema,
    })
  }
})`
</script>

<template>
  <v-container>
    <!-- Header Section -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="text-overline text-secondary font-weight-bold mb-2">
          Nuxtify CMS Module
        </div>
        <h1 class="text-h3 font-weight-bold mb-4">
          CMS & Content Showcase
        </h1>
        <p class="text-subtitle-1 text-medium-emphasis max-width-800">
          The <strong>@nuxtify/cms</strong> module streamlines content management in Nuxt. It bundles predefined collection schemas, responsive UI components, a high-level query composable, and auto-configured sitemaps/SEO for articles, topics, and authors.
        </p>
        <v-divider class="mt-6" />
      </v-col>
    </v-row>

    <!-- Section 1: Dashboard Stats Overview -->
    <v-row class="mb-8">
      <v-col
        cols="12"
        sm="4"
      >
        <v-card
          class="pa-6 border text-center"
          variant="outlined"
        >
          <div class="text-h4 font-weight-bold text-primary mb-1">
            {{ articles?.length || 0 }}
          </div>
          <div class="text-subtitle-1 font-weight-bold">
            Articles Published
          </div>
          <div class="text-caption text-medium-emphasis">
            In-depth markdown files under <code>content/articles/</code>
          </div>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        sm="4"
      >
        <v-card
          class="pa-6 border text-center"
          variant="outlined"
        >
          <div class="text-h4 font-weight-bold text-secondary mb-1">
            {{ topics?.length || 0 }}
          </div>
          <div class="text-subtitle-1 font-weight-bold">
            Active Topics & Tips
          </div>
          <div class="text-caption text-medium-emphasis">
            Taxonomy layers under <code>content/topics/</code>
          </div>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        sm="4"
      >
        <v-card
          class="pa-6 border text-center"
          variant="outlined"
        >
          <div class="text-h4 font-weight-bold text-success mb-1">
            {{ contributors?.length || 0 }}
          </div>
          <div class="text-subtitle-1 font-weight-bold">
            Authors & Contributors
          </div>
          <div class="text-caption text-medium-emphasis">
            Profile metadata files under <code>content/contributors/</code>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Section 2: Live Content Rendering Showcase -->
    <v-row class="mb-8">
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <v-icon
            icon="mdi-database"
            color="primary"
            size="large"
            class="mr-2"
          />
          <h2 class="text-h5 font-weight-bold">
            Live Content Collections
          </h2>
        </div>
        <p class="text-body-1 text-medium-emphasis mb-6">
          Below is live content queried directly from the workspace's markdown database and rendered using pre-built theme layout blocks.
        </p>

        <v-row>
          <!-- Column 1: Articles List -->
          <v-col
            cols="12"
            md="6"
          >
            <v-card
              class="pa-6 border h-100 d-flex flex-column"
              variant="outlined"
            >
              <div class="d-flex justify-space-between align-center mb-4">
                <div class="d-flex align-center">
                  <v-icon
                    icon="mdi-newspaper-variant-outline"
                    color="primary"
                    class="mr-2"
                  />
                  <h3 class="text-subtitle-1 font-weight-bold">
                    Articles Showcase
                  </h3>
                </div>
                <v-btn
                  size="small"
                  color="primary"
                  variant="text"
                  to="/articles"
                  append-icon="mdi-arrow-right"
                  class="text-none"
                >
                  View All
                </v-btn>
              </div>

              <div class="flex-grow-1">
                <div
                  v-if="!articles || articles.length === 0"
                  class="py-8 text-center text-medium-emphasis"
                >
                  No articles found in <code>content/articles/</code>.
                </div>
                <div
                  v-else
                  class="d-flex flex-column ga-6"
                >
                  <v-card
                    v-for="article in articles"
                    :key="article.path"
                    variant="flat"
                    class="pa-4 bg-grey-lighten-4 rounded"
                  >
                    <ArticleCard :article="article" />
                  </v-card>
                </div>
              </div>
            </v-card>
          </v-col>

          <!-- Column 2: Contributors and Topics -->
          <v-col
            cols="12"
            md="6"
            class="d-flex flex-column ga-6"
          >
            <!-- Contributors List -->
            <v-card
              class="pa-6 border d-flex flex-column"
              variant="outlined"
            >
              <div class="d-flex justify-space-between align-center mb-4">
                <div class="d-flex align-center">
                  <v-icon
                    icon="mdi-account-group-outline"
                    color="primary"
                    class="mr-2"
                  />
                  <h3 class="text-subtitle-1 font-weight-bold">
                    Authors & Contributors
                  </h3>
                </div>
                <v-btn
                  size="small"
                  color="success"
                  variant="text"
                  to="/contributors"
                  append-icon="mdi-arrow-right"
                  class="text-none"
                >
                  View All
                </v-btn>
              </div>

              <div
                v-if="!contributors || contributors.length === 0"
                class="py-4 text-center text-medium-emphasis"
              >
                No contributors found.
              </div>
              <v-row
                v-else
                dense
              >
                <v-col
                  v-for="contributor in contributors"
                  :key="contributor.path"
                  cols="12"
                  sm="6"
                >
                  <v-card
                    class="pa-4 bg-grey-lighten-4 rounded h-100 d-flex flex-column align-center text-center"
                    variant="flat"
                    :to="contributor.path"
                  >
                    <v-avatar
                      v-if="contributor.image"
                      size="64"
                      class="mb-3"
                    >
                      <v-img
                        :src="contributor.image.src"
                        :alt="contributor.image.alt"
                      />
                    </v-avatar>
                    <div class="font-weight-bold">
                      {{ contributor.name }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ contributor.jobTitle || 'Contributor' }}
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-card>

            <!-- Topics List -->
            <v-card
              class="pa-6 border d-flex flex-column"
              variant="outlined"
            >
              <div class="d-flex justify-space-between align-center mb-4">
                <div class="d-flex align-center">
                  <v-icon
                    icon="mdi-tag-multiple-outline"
                    color="primary"
                    class="mr-2"
                  />
                  <h3 class="text-subtitle-1 font-weight-bold">
                    Topics & Taxonomies
                  </h3>
                </div>
                <v-btn
                  size="small"
                  color="secondary"
                  variant="text"
                  to="/topics"
                  append-icon="mdi-arrow-right"
                  class="text-none"
                >
                  View All
                </v-btn>
              </div>

              <div
                v-if="!topics || topics.length === 0"
                class="py-4 text-center text-medium-emphasis"
              >
                No topics found.
              </div>
              <div
                v-else
                class="d-flex flex-wrap ga-2"
              >
                <v-chip
                  v-for="topic in topics"
                  :key="topic.path"
                  color="secondary"
                  variant="tonal"
                  class="ma-1"
                  link
                  :to="topic.path"
                  prepend-icon="mdi-tag-outline"
                >
                  {{ topic.title || unslugify(topic.path.split('/').pop() || '') }}
                </v-chip>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Section 3: Developer Highlights & Utilities -->
    <v-row class="mb-8">
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <v-icon
            icon="mdi-code-braces"
            color="primary"
            size="large"
            class="mr-2"
          />
          <h2 class="text-h5 font-weight-bold">
            Developer Integration & Utilities
          </h2>
        </div>
        <p class="text-body-1 text-medium-emphasis mb-6">
          The CMS module includes typed schemas and the <code>usePublicCollection</code> utility, which keeps draft content filtered out in production builds automatically.
        </p>

        <v-row>
          <!-- Schema Configuration Example -->
          <v-col
            cols="12"
            lg="6"
          >
            <v-card
              class="pa-6 border h-100 d-flex flex-column"
              variant="outlined"
            >
              <h3 class="text-subtitle-1 font-weight-bold mb-2">
                1. Configured Schemas
              </h3>
              <p class="text-body-2 text-medium-emphasis mb-4 flex-grow-1">
                Configure your Nuxt Content sources safely with imported schemas from the core utilities. These ensure type safety across all properties.
              </p>
              <v-card
                class="pa-4 bg-grey-darken-4 text-light-blue-lighten-4 font-mono rounded"
                elevation="1"
              >
                <pre style="overflow-x: auto; white-space: pre; font-size: 0.85rem;">{{ configSchemaExample }}</pre>
              </v-card>
            </v-card>
          </v-col>

          <!-- Query Composable Example -->
          <v-col
            cols="12"
            lg="6"
          >
            <v-card
              class="pa-6 border h-100 d-flex flex-column"
              variant="outlined"
            >
              <h3 class="text-subtitle-1 font-weight-bold mb-2">
                2. Smart Querying
              </h3>
              <p class="text-body-2 text-medium-emphasis mb-4 flex-grow-1">
                Use the high-level <code>usePublicCollection</code> helper to fetch markdown content with pre-built support for hiding in-progress draft content.
              </p>
              <v-card
                class="pa-4 bg-grey-darken-4 text-light-blue-lighten-4 font-mono rounded"
                elevation="1"
              >
                <pre style="overflow-x: auto; white-space: pre; font-size: 0.85rem;">{{ queryCodeExample }}</pre>
              </v-card>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>
