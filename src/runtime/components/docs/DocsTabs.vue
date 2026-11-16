<script setup lang="ts">
import { computed } from 'vue'
import type { DocCategoryTab } from '../../utils/docs'

const props = withDefaults(defineProps<{
  categories?: DocCategoryTab[]
}>(), {
  categories: () => [],
})

const activeTab = computed(() => props.categories.find(cat => cat.active)?.path)
</script>

<template>
  <div
    v-if="categories.length > 0"
    class="docs-tabs-bar"
  >
    <div class="docs-tabs-bar__inner">
      <v-tabs
        :model-value="activeTab"
        color="primary"
        slider-color="primary"
        show-arrows
        aria-label="Documentation categories"
      >
        <v-tab
          v-for="category in categories"
          :key="category.path"
          :value="category.path"
          :to="category.to"
          :prepend-icon="category.icon"
          exact
          class="text-none font-weight-medium"
        >
          {{ category.title }}
        </v-tab>
      </v-tabs>
    </div>
  </div>
</template>

<style scoped>
.docs-tabs-bar {
  position: sticky;
  top: var(--v-layout-top, 64px);
  z-index: 20;
  background-color: rgba(var(--v-theme-surface), 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.docs-tabs-bar__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
}
</style>
