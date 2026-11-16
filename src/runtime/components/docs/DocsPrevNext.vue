<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

withDefaults(defineProps<{
  prev?: ContentNavigationItem | null
  next?: ContentNavigationItem | null
}>(), {
  prev: null,
  next: null,
})

function getDescription(item: ContentNavigationItem): string {
  return typeof item.description === 'string' ? item.description : ''
}
</script>

<template>
  <nav
    v-if="prev || next"
    aria-label="Documentation pagination"
    class="docs-prev-next mt-10"
  >
    <v-divider class="mb-6" />

    <v-row dense>
      <v-col
        cols="12"
        sm="6"
      >
        <v-card
          v-if="prev"
          :to="prev.path"
          variant="outlined"
          rounded="lg"
          class="pa-4 fill-height docs-prev-next__card"
        >
          <div class="text-caption text-medium-emphasis d-flex align-center ga-1 mb-1">
            <v-icon
              icon="mdi-arrow-left"
              size="14"
            />
            <span>Previous</span>
          </div>
          <div class="text-subtitle-1 font-weight-semibold text-primary">
            {{ prev.title }}
          </div>
          <p
            v-if="getDescription(prev)"
            class="text-body-2 text-medium-emphasis mt-1 mb-0 docs-prev-next__desc"
          >
            {{ getDescription(prev) }}
          </p>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        sm="6"
      >
        <v-card
          v-if="next"
          :to="next.path"
          variant="outlined"
          rounded="lg"
          class="pa-4 fill-height text-sm-right docs-prev-next__card"
        >
          <div class="text-caption text-medium-emphasis d-flex align-center justify-sm-end ga-1 mb-1">
            <span>Next</span>
            <v-icon
              icon="mdi-arrow-right"
              size="14"
            />
          </div>
          <div class="text-subtitle-1 font-weight-semibold text-primary">
            {{ next.title }}
          </div>
          <p
            v-if="getDescription(next)"
            class="text-body-2 text-medium-emphasis mt-1 mb-0 docs-prev-next__desc"
          >
            {{ getDescription(next) }}
          </p>
        </v-card>
      </v-col>
    </v-row>
  </nav>
</template>

<style scoped>
.docs-prev-next__card {
  transition: border-color 0.15s ease;
}

.docs-prev-next__card:hover {
  border-color: rgb(var(--v-theme-primary));
}

.docs-prev-next__desc {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
