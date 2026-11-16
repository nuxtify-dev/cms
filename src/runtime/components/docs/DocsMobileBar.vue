<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ContentNavigationItem } from '@nuxt/content'
import type { PageTocLink } from '../page/PageToc.vue'

const props = withDefaults(defineProps<{
  sidebarItems?: ContentNavigationItem[]
  tocLinks?: PageTocLink[]
  tocTitle?: string
  currentPath?: string
  hasTabs?: boolean
  showMenu?: boolean
  showToc?: boolean
}>(), {
  sidebarItems: () => [],
  tocLinks: () => [],
  tocTitle: 'On this page',
  currentPath: '',
  hasTabs: false,
  showMenu: true,
  showToc: true,
})

const drawerOpen = ref(false)
const tocExpanded = ref(false)

const canShowMenu = computed(() => props.showMenu && props.sidebarItems.length > 0)
const canShowToc = computed(() => props.showToc && props.tocLinks.length > 0)

watch(
  () => props.currentPath,
  () => {
    drawerOpen.value = false
    tocExpanded.value = false
  },
)
</script>

<template>
  <template v-if="canShowMenu || canShowToc">
    <div :class="['docs-mobile-bar', { 'docs-mobile-bar--with-tabs': hasTabs }]">
      <div class="docs-mobile-bar__inner">
        <v-btn
          v-if="canShowMenu"
          variant="text"
          size="small"
          prepend-icon="mdi-menu"
          class="text-none"
          @click="drawerOpen = true"
        >
          Menu
        </v-btn>

        <v-btn
          v-if="canShowToc"
          variant="text"
          size="small"
          :append-icon="tocExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          class="text-none ml-auto"
          @click="tocExpanded = !tocExpanded"
        >
          {{ tocTitle }}
        </v-btn>
      </div>

      <v-expand-transition>
        <div
          v-if="tocExpanded && canShowToc"
          class="docs-mobile-bar__toc"
        >
          <div class="docs-mobile-bar__toc-inner">
            <PageToc
              :links="tocLinks"
              title=""
              inline
              @select="tocExpanded = false"
            />
          </div>
        </div>
      </v-expand-transition>
    </div>

    <v-navigation-drawer
      v-if="canShowMenu"
      v-model="drawerOpen"
      location="left"
      temporary
      width="280"
    >
      <div class="d-flex align-center justify-space-between px-4 py-3 border-b">
        <span class="text-subtitle-2 font-weight-semibold">Documentation</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          aria-label="Close documentation menu"
          @click="drawerOpen = false"
        />
      </div>

      <div class="pa-3">
        <DocsSidebar
          :items="sidebarItems"
          :current-path="currentPath"
          @navigate="drawerOpen = false"
        />
      </div>
    </v-navigation-drawer>
  </template>
</template>

<style scoped>
.docs-mobile-bar {
  position: sticky;
  top: var(--v-layout-top, 64px);
  z-index: 19;
  background-color: rgba(var(--v-theme-surface), 0.96);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.docs-mobile-bar--with-tabs {
  top: calc(var(--v-layout-top, 64px) + 49px);
}

.docs-mobile-bar__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 6px 16px;
  display: flex;
  align-items: center;
  min-height: 44px;
}

.docs-mobile-bar__toc {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background-color: rgb(var(--v-theme-surface));
}

.docs-mobile-bar__toc-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 12px 16px 16px;
}
</style>
