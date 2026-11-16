<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PageTocLink } from '../page/PageToc.vue'

const props = withDefaults(defineProps<{
  links?: PageTocLink[]
  title?: string
  currentPath?: string
}>(), {
  links: () => [],
  title: 'On this page',
  currentPath: '',
})

const expanded = ref(false)

watch(
  () => props.currentPath,
  () => {
    expanded.value = false
  },
)
</script>

<template>
  <div
    v-if="links.length > 0"
    class="article-mobile-toc mb-6"
  >
    <button
      type="button"
      class="article-mobile-toc__toggle"
      :aria-expanded="expanded"
      aria-controls="article-mobile-toc-panel"
      @click="expanded = !expanded"
    >
      <span class="text-body-2 font-weight-semibold">
        {{ title }}
      </span>
      <v-icon
        :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        size="18"
      />
    </button>

    <v-expand-transition>
      <div
        v-if="expanded"
        id="article-mobile-toc-panel"
        class="article-mobile-toc__panel"
      >
        <PageToc
          :links="links"
          title=""
          inline
        />
      </div>
    </v-expand-transition>
  </div>
</template>

<style scoped>
.article-mobile-toc {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  background-color: rgb(var(--v-theme-surface));
}

.article-mobile-toc__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 14px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: rgb(var(--v-theme-on-surface));
  text-align: left;
  cursor: pointer;
}

.article-mobile-toc__toggle:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: -2px;
}

.article-mobile-toc__panel {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  padding: 12px 14px 14px;
}
</style>
