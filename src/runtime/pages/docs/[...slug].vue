<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'
import { useDisplay } from 'vuetify'
import type { ContentNavigationItem } from '@nuxt/content'
import {
  buildDocsBreadcrumbs,
  findFirstDocLeaf,
  normalizeDocRoutePath,
  resolveDocNavNode,
  rewriteDocsSurroundings,
  splitDocsNavigation,
  toDocsContentPath,
  unwrapDocsNavigationRoot,
} from '../../utils/docs'
import { isNavigationMetaItem, normalizePrefix } from '../../utils/routes'
import { buildArticleSeoMeta } from '../../utils/seo'
import {
  createError,
  navigateTo,
  showError,
  useAsyncData,
  useDocSchema,
  useNuxtifyConfig,
  usePublicCollection,
  usePublicCollectionNavigation,
  usePublicCollectionSurroundings,
  useRoute,
  useSeoMeta,
} from '#imports'

defineOptions({
  name: 'DocsCatchAllPage',
})

const route = useRoute()
const nuxtifyConfig = useNuxtifyConfig()
const { mdAndDown, smAndDown } = useDisplay()

const docsConfig = computed(() => nuxtifyConfig.content?.docs)
const docsPrefix = computed(() => normalizePrefix(docsConfig.value?.routePrefix, '/docs'))
const currentPath = computed(() => normalizeDocRoutePath(route.path))
const contentPath = computed(() => toDocsContentPath(currentPath.value, docsPrefix.value))

const { data: rawNavigation } = await useAsyncData(
  'docs-navigation',
  () => usePublicCollectionNavigation('docs', ['icon']),
)

const navTree = computed(() => unwrapDocsNavigationRoot(rawNavigation.value || [], docsPrefix.value))

const { data: pageState } = await useAsyncData(
  () => `doc-${currentPath.value}`,
  async () => {
    const candidatePaths = Array.from(new Set([contentPath.value, currentPath.value]))
    const matches = await usePublicCollection('docs')
      .where('path', 'IN', candidatePaths)
      .all()

    const preferred = matches.find(
      item => !isNavigationMetaItem(item) && normalizeDocRoutePath(item.path) === contentPath.value,
    ) || matches.find(item => !isNavigationMetaItem(item)) || null

    if (preferred) {
      const shouldLoadPrevNext = docsConfig.value?.prevNext?.enabled !== false && preferred.prevNext !== false
      const rawSurround = shouldLoadPrevNext
        ? await usePublicCollectionSurroundings('docs', preferred.path, { fields: ['description'] })
        : [null, null]

      return {
        doc: preferred,
        prevNext: rewriteDocsSurroundings(rawSurround, docsPrefix.value),
        redirectTo: null as string | null,
      }
    }

    let redirectTarget: ContentNavigationItem | null = null
    if (currentPath.value === docsPrefix.value) {
      redirectTarget = findFirstDocLeaf(navTree.value)
    }
    else {
      const folderNode = resolveDocNavNode(navTree.value, currentPath.value)
      if (folderNode?.children?.length) {
        redirectTarget = findFirstDocLeaf(folderNode.children)
      }
    }

    const redirectTo = redirectTarget && normalizeDocRoutePath(redirectTarget.path) !== currentPath.value
      ? redirectTarget.path
      : null

    return {
      doc: null,
      prevNext: [null, null] as [ContentNavigationItem | null, ContentNavigationItem | null],
      redirectTo,
    }
  },
)

if (!pageState.value?.doc) {
  if (pageState.value?.redirectTo) {
    await navigateTo(pageState.value.redirectTo, { redirectCode: 302, replace: true })
  }
  else {
    throw createError({
      statusCode: 404,
      statusMessage: 'Documentation page not found',
      fatal: true,
    })
  }
}

watch(pageState, async (nextState) => {
  if (!nextState || nextState.doc) return

  if (nextState.redirectTo) {
    await navigateTo(nextState.redirectTo, { replace: true })
  }
  else {
    showError(createError({
      statusCode: 404,
      statusMessage: 'Documentation page not found',
    }))
  }
})

const doc = computed(() => pageState.value?.doc || null)
const prevNext = computed(() => pageState.value?.prevNext || [null, null])

const navState = computed(() => splitDocsNavigation(navTree.value, currentPath.value))
const breadcrumbs = computed(() => buildDocsBreadcrumbs(navTree.value, currentPath.value))

const prevNextEnabled = computed(() =>
  docsConfig.value?.prevNext?.enabled !== false && doc.value?.prevNext !== false,
)

const tocTitle = computed(() => docsConfig.value?.toc?.title || 'On this page')
const tocLinks = computed(() => doc.value?.body?.toc?.links || [])
const tocEnabled = computed(() =>
  docsConfig.value?.toc?.enabled !== false
  && doc.value?.toc !== false
  && tocLinks.value.length > 0,
)

const seoMeta = computed(() => buildArticleSeoMeta(doc.value))
let seoMetaEntry = useSeoMeta(seoMeta.value)
watch(seoMeta, (nextMeta) => {
  seoMetaEntry?.dispose()
  seoMetaEntry = useSeoMeta(nextMeta)
})
onBeforeUnmount(() => {
  seoMetaEntry?.dispose()
})

const hasTabs = computed(() => navState.value.categories.length > 0)
const hasMobileBar = computed(() =>
  mdAndDown.value && ((smAndDown.value && navState.value.sidebarItems.length > 0) || tocEnabled.value),
)
const docsLayoutStyle = computed(() => {
  const tabsHeight = hasTabs.value ? 49 : 0
  const mobileBarHeight = hasMobileBar.value ? 45 : 0
  return {
    '--docs-sticky-offset': `${tabsHeight + mobileBarHeight + 24}px`,
  }
})

const hasSidebar = computed(() => !smAndDown.value && navState.value.sidebarItems.length > 0)
const hasDesktopToc = computed(() => !mdAndDown.value && tocEnabled.value)

const schemaBreadcrumbs = computed(() => {
  const parents = breadcrumbs.value.slice(0, -1)
  if (parents.length > 0) return parents
  if (currentPath.value !== docsPrefix.value) {
    return [{ title: docsConfig.value?.title || 'Docs', to: docsPrefix.value }]
  }
  return []
})

useDocSchema({
  doc,
  section: () => navState.value.activeCategory?.title,
  breadcrumbs: schemaBreadcrumbs,
  path: currentPath,
})
</script>

<template>
  <div
    v-if="doc"
    class="docs-layout"
    :style="docsLayoutStyle"
  >
    <DocsTabs :categories="navState.categories" />

    <DocsMobileBar
      v-if="mdAndDown"
      :sidebar-items="navState.sidebarItems"
      :toc-links="tocLinks"
      :toc-title="tocTitle"
      :current-path="currentPath"
      :has-tabs="hasTabs"
      :show-menu="smAndDown"
      :show-toc="tocEnabled"
    />

    <div class="docs-container">
      <div
        :class="[
          'docs-grid',
          {
            'docs-grid--with-sidebar': hasSidebar,
            'docs-grid--with-toc': hasDesktopToc,
          },
        ]"
      >
        <aside
          v-if="hasSidebar"
          class="docs-sidebar-col docs-sticky-pane"
        >
          <DocsSidebar
            :items="navState.sidebarItems"
            :current-path="currentPath"
          />
        </aside>

        <main class="docs-main-col">
          <DocsTitle
            :title="doc.title"
            :description="doc.description"
            :breadcrumbs="breadcrumbs"
          />

          <PageContentStyles>
            <ContentRenderer :value="doc" />
          </PageContentStyles>

          <DocsPrevNext
            v-if="prevNextEnabled"
            :prev="prevNext[0]"
            :next="prevNext[1]"
          />
        </main>

        <aside
          v-if="hasDesktopToc"
          class="docs-toc-col docs-sticky-pane"
        >
          <PageToc
            :links="tocLinks"
            :title="tocTitle"
          />
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.docs-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px 16px 64px;
}

.docs-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 32px;
  align-items: start;
}

.docs-main-col {
  min-width: 0;
}

.docs-sticky-pane {
  position: sticky;
  top: calc(var(--v-layout-top, 64px) + var(--docs-sticky-offset, 24px));
  max-height: calc(100vh - var(--v-layout-top, 64px) - var(--docs-sticky-offset, 24px) - 16px);
  overflow-y: auto;
}

@media (min-width: 960px) {
  .docs-grid--with-sidebar {
    grid-template-columns: 240px minmax(0, 1fr);
  }
}

@media (min-width: 1280px) {
  .docs-grid--with-toc {
    grid-template-columns: minmax(0, 1fr) 220px;
    gap: 40px;
  }

  .docs-grid--with-sidebar.docs-grid--with-toc {
    grid-template-columns: 240px minmax(0, 1fr) 220px;
    gap: 40px;
  }
}
</style>
