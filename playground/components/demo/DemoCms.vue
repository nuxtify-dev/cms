<script setup lang="ts">
import {
  usePublicCollection,
  useAsyncData,
  useAppConfig,
  unslugify,
  slugify,
  titleCase,
  computed,
} from '#imports'

const appConfig = useAppConfig()
const tagPrependIcon = computed(() => appConfig.nuxtify?.content?.tags?.prependIcon || undefined)

const articlesEnabled = computed(() => appConfig.nuxtify?.content?.articles?.enabled !== false)
const notesEnabled = computed(() => appConfig.nuxtify?.content?.notes?.enabled !== false)
const topicsEnabled = computed(() => appConfig.nuxtify?.content?.topics?.enabled !== false)
const contributorsEnabled = computed(() => appConfig.nuxtify?.content?.contributors?.enabled !== false)
const tagsEnabled = computed(() => appConfig.nuxtify?.content?.tags?.enabled !== false && notesEnabled.value)

const articlesPrefix = computed(() => appConfig.nuxtify?.content?.articles?.routePrefix || '/articles')
const notesPrefix = computed(() => appConfig.nuxtify?.content?.notes?.routePrefix || '/notes')
const topicsPrefix = computed(() => appConfig.nuxtify?.content?.topics?.routePrefix || '/topics')
const contributorsPrefix = computed(() => appConfig.nuxtify?.content?.contributors?.routePrefix || '/contributors')

// FETCH LIVE CONTENT DATA
const { data: articles } = await useAsyncData('demo-cms-articles', () => {
  if (!articlesEnabled.value) return Promise.resolve([])
  return usePublicCollection('articles')
    .order('publishedAt', 'DESC')
    .all()
})

const { data: notes } = await useAsyncData('demo-cms-notes', () => {
  if (!notesEnabled.value) return Promise.resolve([])
  return usePublicCollection('notes')
    .order('publishedAt', 'DESC')
    .all()
})

const { data: contributors } = await useAsyncData('demo-cms-contributors', () => {
  if (!contributorsEnabled.value) return Promise.resolve([])
  return usePublicCollection('contributors').all()
})

const { data: topics } = await useAsyncData('demo-cms-topics', () => {
  if (!topicsEnabled.value) return Promise.resolve([])
  return usePublicCollection('topics').all()
})

// EXTRACT ACTIVE TAGS FROM NOTES
const tags = computed(() => {
  if (!tagsEnabled.value || !notes.value) return []
  const allTags = new Set<string>()
  notes.value.forEach((note) => {
    if (Array.isArray(note.tags)) {
      note.tags.forEach((tag) => {
        if (tag && typeof tag === 'string') {
          allTags.add(tag)
        }
      })
    }
  })
  return Array.from(allTags).sort()
})

// MOCK CODE EXAMPLES FOR DEVELOPERS
const queryCodeExample = `// Query safe public collections & filter by tag
const { data: notes } = await useAsyncData('tagged-notes', () => {
  return usePublicCollection('notes')
    .where('tags', 'LIKE', '%"Nuxt"%')
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
    notes: defineCollection({
      type: 'page',
      source: 'notes/*.md',
      schema: noteSchema,
    }),
    contributors: defineCollection({
      type: 'page',
      source: 'contributors/*.md',
      schema: contributorSchema,
    }),
    topics: defineCollection({
      type: 'page',
      source: 'topics/*.md',
      schema: topicSchema,
    }),
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
          The <strong>@nuxtify/cms</strong> module streamlines content management in Nuxt. It bundles predefined collection schemas, responsive UI components, a high-level query composable, and auto-configured sitemaps/SEO for articles, notes, topics, tags, and contributors.
        </p>
        <v-divider class="mt-6" />
      </v-col>
    </v-row>

    <!-- Section 1: Dashboard Stats Overview -->
    <v-row class="mb-8">
      <v-col
        v-if="articlesEnabled"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card
          class="pa-6 border text-center h-100"
          variant="outlined"
          to="/posts"
        >
          <div class="text-h4 font-weight-bold text-info mb-1">
            {{ articles?.length || 0 }}
          </div>
          <div class="text-subtitle-1 font-weight-bold">
            Articles
          </div>
          <div class="text-caption text-medium-emphasis">
            In-depth markdown files under <code>content/articles/</code>
          </div>
        </v-card>
      </v-col>

      <v-col
        v-if="notesEnabled"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card
          class="pa-6 border text-center h-100"
          variant="outlined"
          to="/notes"
        >
          <div class="text-h4 font-weight-bold text-info mb-1">
            {{ notes?.length || 0 }}
          </div>
          <div class="text-subtitle-1 font-weight-bold">
            Notes
          </div>
          <div class="text-caption text-medium-emphasis">
            Short markdown files under <code>content/notes/</code>
          </div>
        </v-card>
      </v-col>

      <v-col
        v-if="topicsEnabled"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card
          class="pa-6 border text-center h-100"
          variant="outlined"
          to="/topics"
        >
          <div class="text-h4 font-weight-bold text-info mb-1">
            {{ topics?.length || 0 }}
          </div>
          <div class="text-subtitle-1 font-weight-bold">
            Topics
          </div>
          <div class="text-caption text-medium-emphasis">
            Topic markdown files under <code>content/topics/</code>
          </div>
        </v-card>
      </v-col>

      <v-col
        v-if="tagsEnabled"
        cols="12"
        sm="6"
        md="6"
      >
        <v-card
          class="pa-6 border text-center h-100"
          variant="outlined"
        >
          <div class="text-h4 font-weight-bold text-info mb-1">
            {{ tags?.length || 0 }}
          </div>
          <div class="text-subtitle-1 font-weight-bold">
            Tags
          </div>
          <div class="text-caption text-medium-emphasis">
            Dynamic tags tagged across notes
          </div>
        </v-card>
      </v-col>

      <v-col
        v-if="contributorsEnabled"
        cols="12"
        sm="6"
        :md="tagsEnabled ? 6 : 12"
      >
        <v-card
          class="pa-6 border text-center h-100"
          variant="outlined"
          to="/contributors"
        >
          <div class="text-h4 font-weight-bold text-info mb-1">
            {{ contributors?.length || 0 }}
          </div>
          <div class="text-subtitle-1 font-weight-bold">
            Contributors
          </div>
          <div class="text-caption text-medium-emphasis">
            Contributor markdown files under <code>content/contributors/</code>
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

        <!-- Row 1: Long-form Articles & Short-form Notes -->
        <v-row
          v-if="articlesEnabled || notesEnabled"
          class="mb-6"
        >
          <!-- Column 1: Articles List -->
          <v-col
            v-if="articlesEnabled"
            cols="12"
            :md="notesEnabled ? 6 : 12"
          >
            <v-card
              class="pa-6 border h-100 d-flex flex-column"
              variant="outlined"
            >
              <div class="d-flex justify-space-between align-center mb-4">
                <div class="d-flex align-center">
                  <v-icon
                    icon="mdi-newspaper-variant-outline"
                    class="mr-2"
                  />
                  <h3 class="text-subtitle-1 font-weight-bold">
                    Articles Showcase
                  </h3>
                </div>
                <v-btn
                  size="small"
                  color="secondary"
                  variant="text"
                  :to="articlesPrefix"
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

          <!-- Column 2: Notes List -->
          <v-col
            v-if="notesEnabled"
            cols="12"
            :md="articlesEnabled ? 6 : 12"
          >
            <v-card
              class="pa-6 border h-100 d-flex flex-column"
              variant="outlined"
            >
              <div class="d-flex justify-space-between align-center mb-4">
                <div class="d-flex align-center">
                  <v-icon
                    icon="mdi-notebook-outline"
                    class="mr-2"
                  />
                  <h3 class="text-subtitle-1 font-weight-bold">
                    Notes Showcase
                  </h3>
                </div>
                <v-btn
                  size="small"
                  color="secondary"
                  variant="text"
                  :to="notesPrefix"
                  append-icon="mdi-arrow-right"
                  class="text-none"
                >
                  View All
                </v-btn>
              </div>

              <div class="flex-grow-1">
                <div
                  v-if="!notes || notes.length === 0"
                  class="py-8 text-center text-medium-emphasis"
                >
                  No notes found in <code>content/notes/</code>.
                </div>
                <div
                  v-else
                  class="d-flex flex-column ga-4"
                >
                  <NoteCard
                    v-for="note in notes"
                    :key="note.path"
                    :note="note"
                  />
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Row 2: Contributors, Topics & Tags -->
        <v-row v-if="contributorsEnabled || topicsEnabled || tagsEnabled">
          <!-- Column 1: Contributors List -->
          <v-col
            v-if="contributorsEnabled"
            cols="12"
            :md="topicsEnabled || tagsEnabled ? 6 : 12"
          >
            <v-card
              class="pa-6 border h-100 d-flex flex-column"
              variant="outlined"
            >
              <div class="d-flex justify-space-between align-center mb-4">
                <div class="d-flex align-center">
                  <v-icon
                    icon="mdi-account-group-outline"
                    class="mr-2"
                  />
                  <h3 class="text-subtitle-1 font-weight-bold">
                    Contributors
                  </h3>
                </div>
                <v-btn
                  size="small"
                  color="secondary"
                  variant="text"
                  :to="contributorsPrefix"
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
          </v-col>

          <!-- Column 2: Topics & Tags -->
          <v-col
            v-if="topicsEnabled || tagsEnabled"
            cols="12"
            :md="contributorsEnabled ? 6 : 12"
            class="d-flex flex-column ga-6"
          >
            <!-- Topics List -->
            <v-card
              v-if="topicsEnabled"
              class="pa-6 border d-flex flex-column"
              variant="outlined"
            >
              <div class="d-flex justify-space-between align-center mb-4">
                <div class="d-flex align-center">
                  <v-icon
                    icon="mdi-tag-multiple-outline"
                    class="mr-2"
                  />
                  <h3 class="text-subtitle-1 font-weight-bold">
                    Topics
                  </h3>
                </div>
                <v-btn
                  size="small"
                  color="secondary"
                  variant="text"
                  :to="topicsPrefix"
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
                  color="primary"
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

            <!-- Tags List -->
            <v-card
              v-if="tagsEnabled"
              class="pa-6 border d-flex flex-column"
              variant="outlined"
            >
              <div class="d-flex justify-space-between align-center mb-4">
                <div class="d-flex align-center">
                  <v-icon
                    :icon="tagPrependIcon || 'mdi-pound'"
                    class="mr-2"
                  />
                  <h3 class="text-subtitle-1 font-weight-bold">
                    Tags Showcase
                  </h3>
                </div>
              </div>

              <p class="text-body-2 text-medium-emphasis mb-3">
                Tags dynamically index notes and link to filtered feeds at <code>/tags/:slug</code>.
              </p>

              <div
                v-if="!tags || tags.length === 0"
                class="py-4 text-center text-medium-emphasis"
              >
                No tags found in notes.
              </div>
              <div
                v-else
                class="d-flex flex-wrap ga-2"
              >
                <v-chip
                  v-for="tag in tags"
                  :key="tag"
                  color="primary"
                  variant="tonal"
                  class="ma-1"
                  link
                  :to="`/tags/${slugify(tag)}`"
                  :prepend-icon="tagPrependIcon"
                >
                  {{ titleCase(tag) }}
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
              <p class="text-body-2 text-medium-emphasis mb-4">
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
