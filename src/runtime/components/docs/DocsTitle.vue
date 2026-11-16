<script setup lang="ts">
import type { BreadcrumbItem } from '../../../types/link'

withDefaults(defineProps<{
  title?: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
}>(), {
  title: '',
  description: '',
  breadcrumbs: () => [],
})
</script>

<template>
  <header class="docs-title">
    <nav
      v-if="breadcrumbs.length > 0"
      aria-label="Breadcrumbs"
    >
      <v-breadcrumbs
        :items="breadcrumbs"
        density="compact"
        class="px-0 pt-0 pb-2 text-body-2 docs-title__breadcrumbs"
      >
        <template #divider>
          <v-icon
            icon="mdi-chevron-right"
            size="16"
          />
        </template>

        <template #title="{ item }">
          <span :class="item.disabled ? 'text-primary font-weight-medium' : 'text-medium-emphasis'">
            {{ item.title }}
          </span>
        </template>
      </v-breadcrumbs>
    </nav>

    <h1 class="text-h4 text-md-h3 font-weight-bold mb-3">
      {{ title }}
    </h1>

    <p
      v-if="description"
      class="text-subtitle-1 text-md-h6 font-weight-regular text-medium-emphasis mb-0"
    >
      {{ description }}
    </p>

    <v-divider class="my-6" />
  </header>
</template>
